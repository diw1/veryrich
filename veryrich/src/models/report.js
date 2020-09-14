import service from '../services/index'
import {actions} from 'mirrorx'
import _ from 'lodash'
import {globalConstants} from '../globalConstants'

export default {
    name: 'report',
    initialState: {
        dmg: null,
        bossDmg:null,
        fight:null,
        bossTrashDmg:null,
        poisonDmgTaken: null,
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

        async getBossTrashDmg({reportId, trashIds}){
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
        },

        async getExtraBossDmg({reportId, bossTrashIds}){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            bossTrashIds.map(trashId=> {
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
                        bossDmg: result
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


        async getBOSSDmg(reportId){
            const result = await service.getBOSSDMG(reportId)
            actions.report.save({
                bossDmg: result.data.entries
            })
        },

        async getFight(reportId){
            const result = await service.getFight(reportId)
            actions.report.save({
                fight: result.data
            })
        },
    }
}
