import service from '../services/index'
import {actions} from 'mirrorx'
import _ from 'lodash'
import {globalConstants} from '../globalConstants'

export default {
    name: 'report',
    initialState: {
        dmg: null,
        bossDmg:null,
        filteredBossDmg:null,
        fight:null,
        bossTrashDmg:null,
        poisonDmgTaken: null,
        chainDebuff: null,
        webWrapDebuff: null,
        viscidusMeleeFrost: null,
        viscidusBanned: null,
        hunterAura: null,
        manaPotion: null,
        runes: null,
        swiftBoot: null,
        stopWatch: null,
    },
    reducers: {
        save(state, data) {
            return {
                ...state,
                ...data
            }
        },
    },
    effects: {
        getS(data, getState) {
            return getState()
        },

        async getDmg(reportId){
            const result = await service.getDMGdone(reportId)
            actions.report.save({
                dmg: result.data.entries
            })
        },

        async getPoisonDmgTaken(reportId){
            const result = await service.getDamageTakenByAbility(reportId, globalConstants.POISONID)
            actions.report.save({
                poisonDmgTaken: result.data.entries
            })
        },


        async getChainDebuff(reportId){
            const result = await service.getDebuffsByAbility(reportId, globalConstants.CHAINID)
            actions.report.save({
                chainDebuff: result.data.auras
            })
        },

        async getWebWrapDebuff(reportId){
            const result = await service.getDebuffsByAbility(reportId, globalConstants.WEBWRAPID)
            actions.report.save({
                webWrapDebuff: result.data.auras
            })
        },

        async getBossTrashDmg({reportId, trashIds, removedBossIds}){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            trashIds.map(trashId=> {
                promises.push(service.getBOSSTrashDmg(reportId, trashId))
            })
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        const newDmg = trashRecord.data.entries.find(i=>i.id===entry.id)?.total
                        res.total = Number.isInteger(newDmg) ? res.total + newDmg : res.total
                        return res
                    })
                    actions.report.save({
                        bossTrashDmg: result
                    })
                })
            })
            let newPromises = []
            removedBossIds.map(trashId=> {
                newPromises.push(service.getBOSSTrashDmg(reportId, trashId))
            })
            Promise.all(newPromises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        const newDmg = trashRecord.data.entries.find(i=>i.id===entry.id)?.total
                        res.total = Number.isInteger(newDmg) ? res.total - newDmg : res.total
                        return res
                    })
                    actions.report.save({
                        bossTrashDmg: result
                    })
                })
            })
        },

        async getExcludedBossDmg({reportId, removedBossIds}){
            let result = actions.report.getS().report.filteredBossDmg
            let promises = []
            removedBossIds.map(trashId=> {
                promises.push(service.getBOSSTrashDmg(reportId, trashId))
            })
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        const newDmg = trashRecord.data.entries.find(i=>i.id===entry.id)?.total
                        res.total = Number.isInteger(newDmg) ? res.total - newDmg : res.total
                        return res
                    })
                    actions.report.save({
                        filteredBossDmg: result
                    })
                })
            })

        },

        async getBossTrashSunderCasts({reportId, trashIds}){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            trashIds.map(trashId=> {
                promises.push(service.getBOSSTrashCast(reportId, trashId))
            })
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        res.sunder = res.sunder || 0
                        const newCast = trashRecord.data.entries.find(i=>i.id===entry.id)?.abilities.find(ability=>ability.name===
                            '破甲攻击')?.total
                        res.sunder =  Number.isInteger(newCast) ? res.sunder + newCast : res.sunder
                        return res
                    })
                    actions.report.save({
                        bossTrashSunderCasts: result
                    })

                })
            })
        },

        async getViscidusBanned({reportId, viscidusId}){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            promises.push(service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.BLOODTHIRSTID, viscidusId))
            promises.push(service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.EXECUTEID, viscidusId))
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        res.banned = res.banned || 0
                        const newCast = trashRecord.data.entries.find(i=>i.id===entry.id)?.hitCount
                        res.banned =  Number.isInteger(newCast) ? res.banned + newCast : res.banned
                        return res
                    })
                    actions.report.save({
                        viscidusBanned: result
                    })

                })
            })
        },

        async getViscidusCasts({reportId, viscidusId}){
            const result = await service.getBOSSTrashCast(reportId, viscidusId)
            actions.report.save({
                viscidusCasts: result.data.entries
            })
        },

        async getViscidusFrosts({reportId, viscidusId}){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            promises.push(service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.OILFROSTID, viscidusId))
            promises.push(service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.WEAPONFROSTID, viscidusId))
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        res.meleeFrost = res.meleeFrost || 0
                        const newCast = trashRecord.data.entries.find(i=>i.id===entry.id)?.hitCount
                        res.meleeFrost =  Number.isInteger(newCast) ? res.meleeFrost + newCast : res.meleeFrost
                        return res
                    })
                    actions.report.save({
                        viscidusMeleeFrost: result
                    })

                })
            })
        },

        async getBOSSDmg(reportId){
            const result = await service.getBOSSDMG(reportId)
            actions.report.save({
                bossDmg: result.data.entries,
                filteredBossDmg: result.data.entries
            })
        },

        async getFight(reportId){
            const result = await service.getFight(reportId)
            // const enemyData = result.data.enemies.filter(enemy=>!globalConstants.EXCLUDEIDS.includes(enemy.guid) && !globalConstants.BOSSIDS.includes(enemy.guid)).map(enemy=>enemy.guid)
            // console.log(enemyData,'emenydata')
            actions.report.save({
                fight: result.data
            })
        },

        async getManaPotion(reportId){
            const result = await service.getCastsByAbility(reportId, globalConstants.MANA_POTIONID)
            actions.report.save({
                manaPotion: result.data.entries
            })
        },

        async getStopWatch(reportId){
            const result = await service.getCastsByAbility(reportId, globalConstants.STOPWATCH_ID)
            actions.report.save({
                stopWatch: result.data.entries
            })
        },

        async getSwiftBoot(reportId){
            const result = await service.getCastsByAbility(reportId, globalConstants.SWIFT_BOOT_ID)
            actions.report.save({
                swiftBoot: result.data.entries
            })
        },

        async getRunes(reportId){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            promises.push(service.getCastsByAbility(reportId, globalConstants.DARK_RUNEID))
            promises.push(service.getCastsByAbility(reportId, globalConstants.DEMON_RUNEID))
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        res.runes = res.runes || 0
                        const newCast = trashRecord.data.entries.find(i=>i.id===entry.id)?.total
                        res.runes =  Number.isInteger(newCast) ? res.runes + newCast : res.runes
                        return res
                    })
                    actions.report.save({
                        runes: result
                    })

                })
            })
        },

        async getHunterbuff(reportId){
            const result = await service.getBuffsByAbility(reportId, globalConstants.HUNTERAURA)
            actions.report.save({
                hunterAura: result.data.auras
            })
        },
    }
}
