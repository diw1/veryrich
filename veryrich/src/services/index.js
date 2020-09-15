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

function getDamageTakenByAbility (reportID, abilityId) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-taken/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}`
    return getData(url)
}

function getDamageDoneByAbilityAndTarget (reportID, abilityId, targetId) {
    const url = `${globalConstants.BASE_URL}report/tables/damage-done/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}&targetid=${targetId}`
    return getData(url)
}

function getDebuffsByAbility (reportID, abilityId) {
    const url = `${globalConstants.BASE_URL}report/tables/debuffs/${reportID}?api_key=${globalConstants.API_KEY}&end=${globalConstants.ENDTIME}&abilityid=${abilityId}`
    return getData(url)
}

export default {
    getDMGdone,
    getBOSSDMG,
    getBOSSTrashDmg,
    getBOSSTrashCast,
    getFight,
    getDamageTakenByAbility,
    getDebuffsByAbility,
    getDamageDoneByAbilityAndTarget
}
