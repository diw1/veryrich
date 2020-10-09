import React, {Component} from 'react'
import {Button, Input, Table, Card, Tooltip} from 'antd'
import {actions, connect} from 'mirrorx'
import {globalConstants} from './globalConstants'
import './index.css'

const mapStateToProps = state => ({
    bossDmg: state.report.bossDmg,
    fight: state.report.fight,
    bossTrashDmg: state.report.bossTrashDmg,
    bossTrashSunderCasts: state.report.bossTrashSunderCasts,
    poisonDmgTaken: state.report.poisonDmgTaken,
    fearDebuff: state.report.fearDebuff,
    veknissDebuff: state.report.veknissDebuff,
    viscidusCasts: state.report.viscidusCasts,
    viscidusMeleeFrost: state.report.viscidusMeleeFrost,
})

class DashboardPage extends Component{

    constructor(props) {
        super(props)
        this.state={
            report: null,
            loading: false
        }
    }

    submit = () => {
        let promises = []
        this.setState({loading: true})

        promises.push(actions.report.getBOSSDmg(this.state.report))
        promises.push(actions.report.getFight(this.state.report))
        promises.push(actions.report.getPoisonDmgTaken(this.state.report))
        promises.push(actions.report.getFearDebuff(this.state.report))
        promises.push(actions.report.getVeknissDebuff(this.state.report))
        Promise.all(promises).then(()=>{
            promises = []
            const trashIds = this.findTargetIds(globalConstants.TRASHIDS, this.props.fight)
            const bossIds = this.findTargetIds(globalConstants.BOSSIDS, this.props.fight)
            const viscidusId = this.findTargetIds([globalConstants.VISCIDUSID], this.props.fight)
            const bossTrashIds = this.findTargetIds(globalConstants.EXTRABOSSIDS, this.props.fight)
            promises.push(actions.report.getBossTrashDmg({trashIds, reportId: this.state.report}))
            promises.push(actions.report.getExtraBossDmg({bossTrashIds, reportId: this.state.report, viscidusId}))
            promises.push(actions.report.getViscidusCasts({viscidusId, reportId: this.state.report}))
            promises.push(actions.report.getViscidusFrosts({viscidusId, reportId: this.state.report}))
            promises.push(actions.report.getBossTrashSunderCasts({
                trashIds: trashIds.concat(bossIds),
                reportId: this.state.report}))
            Promise.all(promises).then(()=>{
                this.setState({loading: false})
            })
        })
    }

    findTargetIds = (trashIds, fight) => {
        const enemies = fight?.enemies
        return enemies.map(enemy=>trashIds.includes(enemy.guid)&&enemy.id).filter(id=>!!id)
    }

    calculateBossTime = (fight) => {
        let sum = 0
        fight&&fight.fights.filter(record=>record.boss!==0).map(record=>{
            sum+=record.end_time-record.start_time
        })
        return sum/1000
    }

    generateSource = () => {
        const {bossDmg, bossTrashDmg, bossTrashSunderCasts, poisonDmgTaken, fearDebuff, viscidusCasts, viscidusMeleeFrost, veknissDebuff} = this.props
        let bossDmgMax = {}
        let bossTrashDmgMax = {}
        const bossTime = this.calculateBossTime(this.props.fight)
        let source = bossDmg?.map(entry=>{
            const trashDmg = bossTrashDmg?.find(trashEntry=>trashEntry.id===entry.id)?.total
            const sunderCasts = bossTrashSunderCasts?.find(trashEntry=>trashEntry.id===entry.id)?.sunder
            const meleeFrost = viscidusMeleeFrost?.find(trashEntry=>trashEntry.id===entry.id)?.meleeFrost
            const poisonTicks = poisonDmgTaken?.find(trashEntry=>trashEntry.id===entry.id)?.tickCount
            const fearTime = fearDebuff?.find(trashEntry=>trashEntry.id===entry.id)?.totalUptime/1000 || ''
            const veknissDetail = veknissDebuff?.find(trashEntry=>trashEntry.id===entry.id)?.bands?.map(band=>band.endTime-band.startTime)
            const visShots = viscidusCasts?.find(trashEntry=>trashEntry.id===entry.id)?.abilities.find(ability=>ability.name===
                '射击')?.total || 0
            bossDmgMax[entry.type] = bossDmgMax[entry.type] > entry.total ? bossDmgMax[entry.type] : entry.total
            bossTrashDmgMax[entry.type] = bossTrashDmgMax[entry.type] > trashDmg ? bossTrashDmgMax[entry.type] : trashDmg
            return {
                id: entry.id,
                name: entry.name,
                type: entry.type,
                bossDmg: entry.total,
                bossDps: (entry.total/bossTime).toFixed(2),
                bossTrashDmg: trashDmg,
                poisonTicks,
                fearTime,
                veknissDetail,
                sunderCasts,
                visShots,
                meleeFrost
            }
        })

        source = source?.map(entry=>{
            const bossScore =  (entry.bossDmg/bossDmgMax[entry.type]).toFixed(2)
            const bossTrashScore =  (entry.bossTrashDmg/bossTrashDmgMax[entry.type]).toFixed(2)
            entry.bossScore = bossScore
            entry.bossTrashScore = bossTrashScore
            entry.finalScore = ((parseFloat(bossScore)+parseFloat(bossTrashScore))/2) .toFixed(2)
            return entry
        })
        return source
    }

    render() {
        const dataSource =  this.generateSource()
        const columns = [
            {
                title: 'ID',
                dataIndex: 'name',
            },
            {
                title: '职业',
                dataIndex: 'type',
                filters: [
                    {
                        text: '战',
                        value: 'Warrior',
                    },
                    {
                        text: '法',
                        value: 'Mage',
                    },
                    {
                        text: '术',
                        value: 'Warlock',
                    },
                    {
                        text: '猎',
                        value: 'Hunter',
                    },
                    {
                        text: '贼',
                        value: 'Rogue',
                    },
                    {
                        text: '德',
                        value: 'Druid',
                    },
                    {
                        text: '牧',
                        value: 'Priest',
                    },
                    {
                        text: '骑',
                        value: 'Paladin',
                    },
                    {
                        text: '萨',
                        value: 'Shaman',
                    },

                ],
                onFilter: (value, record) => record.type === value ,
            },
            {
                title: 'Boss伤害',
                dataIndex: 'bossDmg',
                sorter: (a, b) => a.bossDmg-b.bossDmg,
            },
            {
                title: 'Boss DPS',
                dataIndex: 'bossDps',
            },
            {
                title: '全程有效伤害',
                dataIndex: 'bossTrashDmg',
                sorter: (a, b) => a.bossTrashDmg-b.bossTrashDmg,
                defaultSortOrder: 'descend',
            },
            {
                title: '战士有效破甲数量',
                dataIndex: 'sunderCasts',
                render: (text,record)=> record.type ==='Warrior' ? text : '',
                sorter: (a, b) => a.sunderCasts-b.sunderCasts,
            },
            {
                title: '三宝恐惧持续时间',
                dataIndex: 'fearTime',
                sorter: (a, b) => a.fearTime-b.fearTime,
            },
            {
                title: '维希度斯',
                children: [{
                    title: '毒箭DOT伤害次数',
                    dataIndex: 'poisonTicks',
                    sorter: (a, b) => a.poisonTicks-b.poisonTicks,
                },
                {
                    title: '近战冰冻次数',
                    dataIndex: 'meleeFrost',
                    sorter: (a, b) => a.meleeFrost-b.meleeFrost,
                },
                {
                    title: '远程魔杖次数',
                    dataIndex: 'visShots',
                    sorter: (a, b) => a.visShots-b.visShots,
                },]
            },
            {
                title: '维克尼斯催化大于1.5秒次数',
                dataIndex: 'veknissDetail',
                render: (text, record) => {
                    return <Tooltip title={<div>{record.veknissDetail?.map((item, i) => <div key={i}>{item / 1000}秒</div>)}</div>}>
                        {record.veknissDetail?.filter(record => record > globalConstants.VEKNISS_THRESHOLD).length}
                    </Tooltip>
                }
            },
            {
                title: 'BOSS分',
                dataIndex: 'bossScore',
            },
            {
                title: '全程分',
                dataIndex: 'bossTrashScore',
            },
            {
                title: '平均分',
                dataIndex: 'finalScore',
                sorter: (a, b) => a.finalScore-b.finalScore,
            },
        ]
        return (
            <Card title={<div>
                <Input
                    style={{width: 400}}
                    placeholder="请粘贴reportID，例如: Jzx9tgnTKvVwAX"
                    onChange={event => this.setState({report: event.target.value})}/>
                <Button onClick={this.submit}>提交</Button>
            </div>}>
                <Table
                    rowClassName={record=>record.type}
                    size="small"
                    loading={this.state.loading}
                    dataSource={dataSource}
                    columns={columns}
                    rowKey='id'
                    pagination={false}
                />
            </Card>
        )
    }
}

export default connect(mapStateToProps, null) (DashboardPage)
