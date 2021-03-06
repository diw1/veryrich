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
        rogueSunderDebuff: null,
        viscidusBanned: null,
        hunterAura: null,
        manaPotion: null,
        runes: null,
        swiftBoot: null,
        stopWatch: null,
        fightsData: null,
        tactics: null,
        thaddiusTactics: null,
        slimeTactics: null,
        fourTactics: null,
        spiderTactics: null,
        kelParry: null,
        bossTrashLess5SunderCasts:null
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

        async getRogueSunderDebuff(reportId){
            const result = await service.getDebuffsByAbility(reportId, globalConstants.SUNDERDEBUFFID, true)
            const validIds= [...globalConstants.TRASHIDS, ...globalConstants.BOSSIDS].filter(x=>!globalConstants.REMOVEBOSSIDS.includes(x))
            actions.report.save({
                rogueSunderDebuff: result.data?.auras?.filter(aura=>validIds.includes(aura.guid)).reduce((sum,i)=>sum+Number(i.totalUses),0)
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
                        res.rogueSunder = !!trashRecord.data.entries.find(i=>i.id===entry.id)?.abilities.find(ability=>ability.name===
                            '破甲')
                        return res
                    })
                    actions.report.save({
                        bossTrashSunderCasts: result
                    })

                })
            })
        },

        async getBossTrashLess5SunderCasts({reportId, trashIds}){
            let result = actions.report.getS().report.bossDmg
            let promises = []
            trashIds.map(trashId=> {
                promises.push(service.getBOSSTrashSundarCast(reportId, trashId))
            })
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        res.less5sunder = res.less5sunder || 0
                        const newCast = trashRecord.data.entries.find(i=>i.id===entry.id)?.abilities.find(ability=>ability.name===
                            '破甲攻击')?.total
                        res.less5sunder =  Number.isInteger(newCast) ? res.less5sunder + newCast : res.less5sunder
                        return res
                    })
                    actions.report.save({
                        bossTrashLess5SunderCasts: result
                    })

                })
            })
        },

        async getBOSSDmg(reportId){
            const result = await service.getBOSSDMG(reportId)
            actions.report.save({
                bossDmg: result.data.entries,
                filteredBossDmg: result.data.entries,
                tactics: result.data.entries
            })
        },

        async getFight(reportId){
            const result = await service.getFight(reportId)
            actions.report.save({
                fight: result.data
            })
        },

        async getFightsData(reportId){
            let report = actions.report.getS().report
            let {fight} = report
            const {fights} = fight
            const fightsPromises = fights.map(async fight=> {
                const fightsSummary = await service.getFightSummary(reportId, fight.start_time, fight.end_time)
                let record = {
                    BattleID: fight.id,
                    BattleName: fight.name,
                    StartTime: fight.start_time,
                    EndTime: fight.end_time,
                    BossID: fight.boss
                }
                return fightsSummary.data?.composition?.filter(player=>(player.type === 'Warrior' || player.type === 'Rogue')).map(player=>{
                    let fightDetail = {
                        ...record,
                        name: player.name,
                        class: player.type,
                        mark: record.BattleID+player.name,
                        damageDone: fightsSummary.data?.damageDone?.find(record=>record.id===player.id)?.total || 0,
                        healing: fightsSummary.data?.healingDone?.find(record=>record.id===player.id)?.total || 0,
                    }
                    // if (fightDetail.BossID === globalConstants.MAEXXNA_ENCOUNTER_ID){
                    //     const debuffDmg = webWrapDebuff.find(debuff=>debuff.id===player.id)?.debuffDmg
                    //     fightDetail.damageDone = debuffDmg ? fightDetail.damageDone + debuffDmg : fightDetail.damageDone
                    // }
                    // if (fightDetail.BossID === globalConstants.KEL_ENCOUNTER_ID){
                    //     // const debuffDmg = chainDebuff.find(debuff=>debuff.id===player.id)?.debuffDmg
                    //     // fightDetail.damageDone = debuffDmg ? fightDetail.damageDone + debuffDmg : fightDetail.damageDone
                    //     const parryDmg = kelParry.find(parry=>parry.id===player.id)?.kelParryDmg
                    //     fightDetail.damageDone = parryDmg ? fightDetail.damageDone + parryDmg : fightDetail.damageDone
                    // }
                    return (fightDetail)
                })
            })
            Promise.all(fightsPromises).then(trashRecords=> {
                const fightsData = trashRecords.reduce((sum, trashRecord) => sum.concat(trashRecord), [])
                actions.report.save({
                    fightsData: fightsData
                })}
            )

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

        async getSlime({reportId, slimeID}){
            let result = actions.report.getS().report.tactics
            //小软的致密伤害
            service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.DENSE_BOMB, slimeID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.dense1 =  Number.isInteger(newCast) ? newCast : 0
                    return res
                })
                actions.report.save({
                    slimeTactics: result
                })
            })
            //小软的帽子伤害
            service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.HAT, slimeID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.hat =  Number.isInteger(newCast) ? newCast : 0
                    return res
                })
                actions.report.save({
                    slimeTactics: result
                })
            })
            // 瘟疫1滋补
            const nothCurse = await service.getDebuffsByAbility(reportId, globalConstants.NOTH_CURSE_ID)
            service.getBuffsByAbilityAndEncounter(reportId, globalConstants.RESTO, globalConstants.NOTH_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const hasDebuff = nothCurse.data.auras.find(i=>i.id===entry.id)
                    const hasRes = record.data.auras.find(i=>i.id===entry.id)?.totalUptime > 5000
                    res.resto =  hasDebuff && !hasRes
                    return res
                })
                actions.report.save({
                    slimeTactics: result
                })
            })
            //跳舞男迅捷鞋
            service.getCastsByAbilityAndEncounter(reportId, 0, globalConstants.HEIGAN_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.gear.find(i=>i.id===globalConstants.SWIFT_BOOT_ITEM_ID)? 1 :0
                    res.swiftBoot =  Number.isInteger(newCast) ? newCast : 0
                    return res
                })
                actions.report.save({
                    slimeTactics: result
                })
            })
        },

        async getThaddius(reportId){
            let result = actions.report.getS().report.tactics
            //电男死愿
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.DEATHWISH, globalConstants.THADDIUS_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish1 = res.deathwish1 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish1 =  Number.isInteger(newCast) ? res.deathwish1 + newCast : res.deathwish1
                    return res
                })
                actions.report.save({
                    thaddiusTactics: result
                })
            })
            //电男冲动
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.RUSH, globalConstants.THADDIUS_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish1 = res.deathwish1 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish1 =  Number.isInteger(newCast) ? res.deathwish1 + newCast : res.deathwish1
                    return res
                })
                actions.report.save({
                    thaddiusTactics: result
                })
            })
            //孢子死愿
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.DEATHWISH, globalConstants.LOATHEB_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish2 = res.deathwish2 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish2 =  Number.isInteger(newCast) ? res.deathwish2 + newCast : res.deathwish2
                    return res
                })
                actions.report.save({
                    thaddiusTactics: result
                })
            })
            //孢子冲动
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.RUSH, globalConstants.LOATHEB_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish2 = res.deathwish2 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish2 =  Number.isInteger(newCast) ? res.deathwish2 + newCast : res.deathwish2
                    return res
                })
                actions.report.save({
                    thaddiusTactics: result
                })
            })
        },

        async get4DK(reportId){
            let result = actions.report.getS().report.tactics
            const fight =  actions.report.getS().report.fight
            const start = fight.fights.find(record=>record.boss===1113).end_time
            const end = fight.fights.find(record=>record.boss===1109).start_time
            service.getBuffsByAbilityAndTime(reportId, globalConstants.STONESHIELD, start, end).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.stoneShield =  record.data.auras?.find(i=>i.id===entry.id)
                    return res
                })
                actions.report.save({
                    fourTactics: result
                })
            })
            //4DK 死愿
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.DEATHWISH, globalConstants.FOUR_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish3 = res.deathwish3 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish3 =  Number.isInteger(newCast) ? res.deathwish3 + newCast : res.deathwish3
                    return res
                })
                actions.report.save({
                    fourTactics: result
                })
            })
            //4DK 冲动
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.RUSH, globalConstants.FOUR_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish3 = res.deathwish3 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish3 =  Number.isInteger(newCast) ? res.deathwish3 + newCast : res.deathwish3
                    return res
                })
                actions.report.save({
                    fourTactics: result
                })
            })
            //4DK 鲁莽
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.RECKLESSNESS, globalConstants.FOUR_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.recklessness = res.recklessness || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.recklessness =  Number.isInteger(newCast) ? res.recklessness + newCast : res.recklessness
                    return res
                })
                actions.report.save({
                    fourTactics: result
                })
            })
            //4DK 剑舞
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.BLADEFLURRY, globalConstants.FOUR_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.recklessness = res.recklessness || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.recklessness =  Number.isInteger(newCast) ? res.recklessness + newCast : res.recklessness
                    return res
                })
                actions.report.save({
                    fourTactics: result
                })
            })
            //4DK 暗抗
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.DARKRES, globalConstants.FOUR_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.darkres =  Number.isInteger(newCast) ? newCast : 0
                    return res
                })
                actions.report.save({
                    fourTactics: result
                })
            })
        },

        async getSpider({reportId, interruptID}){
            let result = actions.report.getS().report.tactics
            //蜘蛛群自然抗吸收
            service.getDamageTakenByAbility(reportId, globalConstants.NATUREDMG1).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.natureres = res.natureres || false
                    const absorb = record.data.entries.find(i=>i.id===entry.id)?.hitdetails.length>0 ?
                        record.data.entries.find(i=>i.id===entry.id).hitdetails.find(hitdetail=> hitdetail.type==='Absorb'
                            || hitdetail.type==='Tick Absorb' || hitdetail.type==='Resist' || hitdetail.type==='Hit' && hitdetail.absorbOrOverheal>0) : true
                    res.natureres =  absorb || res.natureres
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })

            service.getDamageTakenByAbility(reportId, globalConstants.NATUREDMG2).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.natureres = res.natureres || false
                    const absorb = record.data.entries.find(i=>i.id===entry.id)?.hitdetails.length>0 ?
                        record.data.entries.find(i=>i.id===entry.id).hitdetails.find(hitdetail=> hitdetail.type==='Absorb'
                            || hitdetail.type==='Tick Absorb' || hitdetail.type==='Resist' || hitdetail.type==='Hit' && hitdetail.absorbOrOverheal>0) : true
                    res.natureres =  absorb || res.natureres
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })
            // 侍僧地精工兵
            service.getDamageDoneByAbilityAndTarget(reportId, globalConstants.SAPPER, interruptID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.sapper = res.sapper || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.sapper =  Number.isInteger(newCast) ? res.sapper + newCast : res.sapper
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })
            //一波流吸收
            service.getDamageTakenByAbility(reportId, globalConstants.SHADOW_BRUST).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.darkAbsorb = true
                    const absorb = record.data.entries.find(i=>i.id===entry.id)?.hitdetails.length>0 ?
                        record.data.entries.find(i=>i.id===entry.id).hitdetails.find(hitdetail=> hitdetail.type==='Absorb'
                            || hitdetail.type==='Tick Absorb' || hitdetail.type==='Resist' || hitdetail.type==='Tick' && hitdetail.absorbOrOverheal>0) : true
                    res.darkAbsorb =  absorb
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })

            // 火箭鞋打蜘蛛1
            service.getCastsByAbilityAndEncounter(reportId, 0, globalConstants.ANUB_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.gear.find(i=>i.id===globalConstants.ROCKET_BOOT_ITEM_ID)? 1 :0
                    res.rocketBoot =  Number.isInteger(newCast) ? newCast : 0
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })
            //冰龙的暗抗
            service.getDamageTakenByAbility(reportId, globalConstants.LIFE_STEAL_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.darkres2 =  true
                    const absorb = record.data.entries.find(i=>i.id===entry.id)?.hitdetails.length>0 ?
                        record.data.entries.find(i=>i.id===entry.id).hitdetails.find(hitdetail=> hitdetail.type==='Absorb'
                            || hitdetail.type==='Tick Absorb' || hitdetail.type==='Resist' || hitdetail.type==='Tick' && hitdetail.absorbOrOverheal>0) : true
                    res.darkres2 =  absorb
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })
            //冰龙死愿
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.DEATHWISH, globalConstants.SAPPHIRON_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.deathwish4 = res.deathwish4 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.deathwish4 =  Number.isInteger(newCast) ? res.deathwish4 + newCast : res.deathwish4
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })

            // 老克打断
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.PUMMEL, globalConstants.KEL_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.interrupt2 = res.interrupt2 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.hitCount
                    res.interrupt2 =  Number.isInteger(newCast) ? res.interrupt2 + newCast : res.interrupt2
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })

            service.getCastsByAbilityAndEncounter(reportId, globalConstants.SHIELDBASH, globalConstants.KEL_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.interrupt2 = res.interrupt2 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.hitCount
                    res.interrupt2 =  Number.isInteger(newCast) ? res.interrupt2 + newCast : res.interrupt2
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })

            service.getCastsByAbilityAndEncounter(reportId, globalConstants.KICK, globalConstants.KEL_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    res.interrupt2 = res.interrupt2 || 0
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.hitCount
                    res.interrupt2 =  Number.isInteger(newCast) ? res.interrupt2 + newCast : res.interrupt2
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })

            //老克冰抗
            service.getCastsByAbilityAndEncounter(reportId, globalConstants.ICERES, globalConstants.KEL_ENCOUNTER_ID).then(record=>{
                result = result.map(entry=>{
                    let res = _.cloneDeep(entry)
                    const newCast = record.data.entries.find(i=>i.id===entry.id)?.total
                    res.iceres =  Number.isInteger(newCast) ? newCast : 0
                    return res
                })
                actions.report.save({
                    spiderTactics: result
                })
            })
        },

        async getChainDebuff(reportId){
            const result = await service.getDebuffsByAbility(reportId, globalConstants.CHAINID)
            const damage = await service.getDamageDoneByAbilityAndEncounter(reportId, 0, globalConstants.KEL_ENCOUNTER_ID)
            const bossFight = actions.report.getS().report.fight.fights.find(fight=>fight.boss===globalConstants.KEL_ENCOUNTER_ID)
            const bossTime = bossFight.end_time-bossFight.start_time
            const chainDebuff = result.data.auras.map(debuff=>{
                const playerDMG = damage.data.entries?.find(dmg=> debuff.id === dmg.id)?.total
                const avg = playerDMG/(bossTime-debuff.totalUptime)
                const debuffDmg = Math.floor(avg*debuff.totalUptime)
                return {...debuff, debuffDmg}
            })
            actions.report.save({
                chainDebuff
            })
        },

        async getWebWrapDebuff(reportId){
            const result = await service.getDebuffsByAbility(reportId, globalConstants.WEBWRAPID)
            const damage = await service.getDamageDoneByAbilityAndEncounter(reportId, 0, globalConstants.MAEXXNA_ENCOUNTER_ID)
            const bossFight = actions.report.getS().report.fight.fights.find(fight=>fight.boss===globalConstants.MAEXXNA_ENCOUNTER_ID)
            const bossTime = bossFight.end_time-bossFight.start_time
            const webWrapDebuff = result.data.auras.map(debuff=>{
                const totalUptime = debuff.totalUptime + globalConstants.WEB_WRAP_RUN * debuff.bands.length * 1000
                const playerDMG = damage.data.entries?.find(dmg=> debuff.id === dmg.id)?.total
                const avg = playerDMG/(bossTime-totalUptime)
                const debuffDmg = Math.floor(avg* totalUptime)
                return {...debuff, debuffDmg, totalUptime}
            })
            actions.report.save({
                webWrapDebuff
            })
        },

        async getKelParry({reportId, kelID}) {
            const {BS1_ID, BS4_ID, MELEE_ID, WW_ID, EX_ID, HS_ID} = globalConstants
            let abilities = [BS1_ID, BS4_ID, MELEE_ID, WW_ID, EX_ID, HS_ID]
            let result = actions.report.getS().report.bossDmg
            let promises = []
            abilities.map((abilityID)=> promises.push(service.getDamageDoneByAbilityAndTarget(reportId, abilityID, kelID)))
            Promise.all(promises).then(trashRecords=>{
                trashRecords.map(trashRecord=>{
                    const isMelee = trashRecord.data.entries.find(i=>i.type==='Warrior') && trashRecord.data.entries.find(i=>i.type==='Rogue')
                    result = result.map(entry=>{
                        let res = _.cloneDeep(entry)
                        res.kelParryDmg = res.kelParryDmg || 0
                        const player = trashRecord.data.entries.find(i=>i.id===entry.id)
                        const avgDmg = player?.hitCount ? player?.total/player?.hitCount : 0
                        const parryCount = avgDmg && player?.missdetails.find(detail=>detail.type==='Parry')?.count
                        const cpDmg = parryCount && Math.floor(avgDmg * parryCount * (player.type==='Warrior' && isMelee ? 2: 1))
                        res.kelParryDmg = Number.isInteger(cpDmg) ? res.kelParryDmg + cpDmg : res.kelParryDmg
                        return res
                    })
                    actions.report.save({
                        kelParry: result
                    })
                })
            })
        }
    }

}
