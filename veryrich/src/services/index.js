import { getData } from './axios'
import {globalConstants} from '../globalConstants'


function getDMGdone (reportID) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-done/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}`
    return getData(url)
}

function getBOSSDMG (reportID) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-done/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&targetclass=boss`
    return getData(url)
}

function getBOSSTrashDmg (reportID, trashIDs) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-done/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&targetid=${trashIDs}`
    return getData(url)
}

function getBOSSTrashCast (reportID, trashIDs) {
    const url = `${globalConstants.BASE_URL}report/tables/casts/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&targetid=${trashIDs}`
    return getData(url)
}

function getFight (reportID) {
    const url = `${globalConstants.BASE_URL}report/fights/${reportID}?api_key=${globalConstants.API_KEY}`
    return getData(url)
}

function getFightSummary (reportID, start, end) {
    const url = `${globalConstants.BASE_URL}report/tables/summary/${reportID}?api_key=${globalConstants.API_KEY}&start=${start}&end=${end}`
    return getData(url)
}

function getDamageTakenByAbility (reportID, abilityId) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-taken/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}`
    return getData(url)
}

function getDamageDoneByAbilityAndTarget (reportID, abilityId, targetId) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-done/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}&targetid=${targetId}`
    return getData(url)
}

function getDebuffsByAbility (reportID, abilityId, enemy= false) {
    const url = `${globalConstants.BASE_URL}report/tables/debuffs/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}&hostility=${enemy?1:0}`
    return getData(url)
}

function getBuffsByAbility (reportID, abilityId) {
    const url = `${globalConstants.BASE_URL}report/tables/buffs/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}`
    return getData(url)
}

function getBuffsByAbilityAndTime (reportID, abilityId, start, end) {
    const url = `${globalConstants.BASE_URL}report/tables/buffs/${reportID}?api_key=${globalConstants.API_KEY}&start=${start}&end=${end}&abilityid=${abilityId}`
    return getData(url)
}

function getBuffsByAbilityAndEncounter (reportID, abilityId, encounterID) {
    const url = `${globalConstants.BASE_URL}report/tables/buffs/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}&encounter=${encounterID}`
    return getData(url)
}

function getCastsByAbility (reportID, abilityId) {
    const url = `${globalConstants.BASE_URL}report/tables/casts/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}`
    return getData(url)
}

function getCastsByAbilityAndEncounter (reportID, abilityId, encounterID) {
    const url = `${globalConstants.BASE_URL}report/tables/casts/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}&encounter=${encounterID}`
    return getData(url)
}

function getDamageDoneByAbilityAndEncounter (reportID, abilityId, encounterID) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-done/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}&encounter=${encounterID}`
    return getData(url)
}

export default {
    getDMGdone,
    getBOSSDMG,
    getBOSSTrashDmg,
    getBOSSTrashCast,
    getFight,
    getFightSummary,
    getDamageTakenByAbility,
    getDebuffsByAbility,
    getDamageDoneByAbilityAndTarget,
    getCastsByAbility,
    getBuffsByAbility,
    getBuffsByAbilityAndTime,
    getBuffsByAbilityAndEncounter,
    getCastsByAbilityAndEncounter,
    getDamageDoneByAbilityAndEncounter
}
