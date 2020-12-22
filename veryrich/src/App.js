import React, {Component} from 'react'
import _ from 'lodash'
import {Button, Input, Table, Card, Tooltip, Col, Row, Switch} from 'antd'
import {QuestionCircleOutlined} from '@ant-design/icons'
import {actions, connect} from 'mirrorx'
import {globalConstants} from './globalConstants'
import './index.css'
import ReactExport from 'react-data-export'
import TacticalTable from './Tactical'

const ExcelFile = ReactExport.ExcelFile
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn

class DashboardPage extends Component{

    constructor(props) {
        super(props)
        this.state={
            report: null,
            loading: false,
            manual: [],
            tactical: false
        }
    }

    downloadExcel = () => {
        this.setState({loading: true})
        actions.report.getFight(this.state.report).then(()=>{
            actions.report.getFightsData(this.state.report).then(()=>{
                this.setState({loading: false})
            })
        })
    }

    submit = () => {
        const {tactical, report} = this.state
        let promises = []
        this.setState({loading: true})
        promises.push(actions.report.getBOSSDmg(this.state.report))
        promises.push(actions.report.getFight(this.state.report))
        Promise.all(promises).then(()=>{
            promises = []
            if (tactical){
                const slimeID = this.findTargetIds([globalConstants.SLIME], this.props.fight)
                promises.push(actions.report.getSlime({reportId: report, slimeID}))
                promises.push(actions.report.getThaddius(report))
                promises.push(actions.report.get4DK(report))
            }else {
                const trashIds = this.findTargetIds(globalConstants.TRASHIDS, this.props.fight)
                const filteredBossIds = this.findTargetIds(globalConstants.BOSSIDS.filter(v => !globalConstants.REMOVEBOSSIDS.includes(v)), this.props.fight)
                const removedBossIds = this.findTargetIds(globalConstants.REMOVEBOSSIDS, this.props.fight)
                promises.push(actions.report.getBossTrashDmg({trashIds, reportId: report, removedBossIds}))
                promises.push(actions.report.getExcludedBossDmg({removedBossIds, reportId: report}))
                promises.push(actions.report.getManaPotion(report))
                promises.push(actions.report.getRogueSunderDebuff(report))
                promises.push(actions.report.getChainDebuff(report))
                promises.push(actions.report.getWebWrapDebuff(report))
                promises.push(actions.report.getRunes(report))
                promises.push(actions.report.getHunterbuff(report))
                promises.push(actions.report.getBossTrashSunderCasts({
                    trashIds: trashIds.concat(filteredBossIds),
                    reportId: this.state.report}))
            }
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

    calculatedSunderAvg = (sunderCasts) => {
        let sumWithoutTop4 = sunderCasts?.map(i=>i.sunder).sort((a,b)=>b-a).slice(4).reduce((sum, item)=>sum+item)
        let furyWarriorCounts = sunderCasts?.filter(item=> item.type ==='Warrior')?.length
        return Math.floor(sumWithoutTop4/(furyWarriorCounts-4)*0.7)
    }

    calculateManualSum = (manual) => {
        const newManual = {...manual, id:0}
        return Object.values(newManual)?.reduce((a, b) => a + b, 0)
    }

    generateSource = () => {
        const {bossDmg, bossTrashDmg, bossTrashSunderCasts, manaPotion, runes, filteredBossDmg, hunterAura, chainDebuff, webWrapDebuff, rogueSunderDebuff} = this.props
        let finalDmgMax = {}
        const sunderBase = this.calculatedSunderAvg(bossTrashSunderCasts)
        let source = bossDmg?.map(entry=>{
            const trashDmg = bossTrashDmg?.find(trashEntry=>trashEntry.id===entry.id)?.total
            const filteredBossDmgData = filteredBossDmg?.find(trashEntry=>trashEntry.id===entry.id)?.total
            const sunderCasts = entry.type === 'Warrior' ? bossTrashSunderCasts?.find(trashEntry=>trashEntry.id===entry.id)?.sunder :
                bossTrashSunderCasts?.find(trashEntry=>trashEntry.id===entry.id)?.rogueSunder ? rogueSunderDebuff : 0
            const sunderPenalty = entry.type==='Warrior' ? sunderCasts < sunderBase  ? Math.floor(-0.05 * trashDmg) : 0 :
                entry.type==='Rogue' ? sunderCasts * 2000 : 0
            const manual = this.state.manual.find(trashEntry=>trashEntry.id===entry.id) || {}
            const manaPotionCasts = manaPotion?.find(trashEntry=>trashEntry.id===entry.id)?.total || 0
            const runesCasts = runes?.find(trashEntry=>trashEntry.id===entry.id)?.runes
            const chainTime = Math.round(chainDebuff?.find(trashEntry=>trashEntry.id===entry.id)?.totalUptime/1000) || ''
            const webWrapTime = Math.round(webWrapDebuff?.find(trashEntry=>trashEntry.id===entry.id)?.totalUptime/1000) || ''
            const hunterAuraStatus = hunterAura?.find(trashEntry=>trashEntry.id===entry.id)?.totalUses>12 || hunterAura?.find(trashEntry=>trashEntry.id===entry.id)?.totalUptime>500000
            const hunterAuraPenalty = hunterAuraStatus && (entry.type==='Warrior'||entry.type==='Rogue') ? Math.floor(-0.015 * trashDmg) : 0
            const finalDamage = Number(trashDmg) + Number(sunderPenalty) + Number(hunterAuraPenalty) + this.calculateManualSum(manual)
            finalDmgMax[entry.type] = finalDmgMax[entry.type] > finalDamage ? finalDmgMax[entry.type] : finalDamage
            return {
                id: entry.id,
                name: entry.name,
                type: entry.type,
                bossDmg: entry.total,
                bossTrashDmg: trashDmg,
                sunderCasts,
                manaPotionCasts,
                runesCasts,
                filteredBossDmgData,
                sunderPenalty,
                hunterAuraPenalty,
                finalDamage,
                chainTime,
                webWrapTime,
                manual
            }
        })

        source = source?.map(entry=>{
            entry.finalScore = (entry.finalDamage/finalDmgMax[entry.type]).toFixed(2)
            return entry
        })
        return source
    }

    handleManualChange = (e, record, type) => {
        const newManual = this.state.manual.find(item=>item.id == record.id) ?
            this.state.manual.map(item=>item.id === record.id ? {...item, [type]: Number(e.target.value)} : item) :
            this.state.manual.concat([{id: record.id, [type]: Number(e.target.value)}])
        this.setState({
            manual: newManual
        })
    }

    mergeTactics = () => {
        const {slimeTactics, thaddiusTactics, fourTactics} = this.props
        const tacticsArray = [slimeTactics, thaddiusTactics, fourTactics]
        return _.zipWith(...tacticsArray, (a,b,c)=>({...a,...b,...c}))
    }

    render() {
        const {fightsData, bossTrashSunderCasts} = this.props
        const tactics = this.mergeTactics()
        const {tactical, loading} = this.state
        const sunderBase = this.calculatedSunderAvg(bossTrashSunderCasts)
        const dataSource =  this.generateSource()
        const excelDataSource = fightsData
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
                title: <Tooltip title="去除DK2, DK3，孢子男，电男的伤害">
                    <span>有效boss伤害<QuestionCircleOutlined /></span>
                </Tooltip>,
                dataIndex: 'filteredBossDmgData',
            },
            {
                title: '全程有效伤害',
                dataIndex: 'bossTrashDmg',
                sorter: (a, b) => a.bossTrashDmg-b.bossTrashDmg,
            },
            {
                title: <Tooltip title="贼的破甲为强破">
                    <span>有效破甲<QuestionCircleOutlined /></span>
                </Tooltip>,
                dataIndex: 'sunderCasts',
                render: (text,record)=> record.type ==='Warrior' || record.type ==='Rogue' ? text : '',
            },
            {
                title: <Tooltip title={`平均数的70%为: ${sunderBase}，不足的扣5%有效伤害, 贼每个成功的强破补偿2000伤害`}>
                    <span>破甲补/扣分<QuestionCircleOutlined /></span>
                </Tooltip>,
                dataIndex: 'sunderPenalty',
                render: text=> text !== 0 ? text : null,
            },
            {
                title: <Tooltip title="扣1.5%有效伤害">
                    <span>强击光环扣除<QuestionCircleOutlined /></span>
                </Tooltip>,
                dataIndex: 'hunterAuraPenalty',
                render: text=> text !== 0 ? text : null,
            },
            {
                title: '老克心控',
                children: [
                    {
                        title: '时间',
                        dataIndex: 'chainTime',
                    },
                    {
                        title: '补分',
                        dataIndex: ['manual','chain'],
                        render: (text, record) => <Input value={this.state.manual.chain} onBlur={(e)=>this.handleManualChange(e, record, 'chain')} style={{maxWidth: 85}}/>
                    },

                ]
            },
            {
                title:<Tooltip title="蜘蛛3上墙">
                    <span>蛛网裹体<QuestionCircleOutlined /></span>
                </Tooltip>,
                children: [
                    {
                        title: '时间',
                        dataIndex: 'webWrapTime',
                    },
                    {
                        title: '补分',
                        dataIndex: ['manual','web'],
                        render: (text, record) => <Input value={this.state.manual.web} onBlur={(e)=>this.handleManualChange(e, record, 'web')} style={{maxWidth: 85}}/>
                    },

                ]
            },
            {
                title:<Tooltip title="传送时间无法自动获取">
                    <span>跳舞男传送<QuestionCircleOutlined /></span>
                </Tooltip>,
                children: [
                    {
                        title: '补分',
                        dataIndex: ['manual','tel'],
                        render: (text, record) => <Input value={this.state.manual.tel} onBlur={(e)=>this.handleManualChange(e, record, 'tel')} style={{maxWidth: 85}}/>
                    },

                ]
            },
            {
                title: '大蓝',
                dataIndex: 'manaPotionCasts',
                sorter: (a, b) => a.manaPotionCasts-b.manaPotionCasts,
            },
            {
                title: '符文',
                dataIndex: 'runesCasts',
                sorter: (a, b) => a.runesCasts-b.runesCasts,
            },
            {
                title: '其他补/扣分',
                dataIndex: ['manual','other'],
                render: (text, record) => <Input value={this.state.manual.other} onBlur={(e)=>this.handleManualChange(e, record, 'other')} style={{maxWidth: 100}}/>
            },
            {
                title: '总分',
                dataIndex: 'finalDamage',
                sorter: (a, b) => a.finalDamage-b.finalDamage,
                defaultSortOrder: 'descend',
            },
            {
                title: '百分比',
                dataIndex: 'finalScore',
            },
        ]
        return (
            <Card title={<Row type="flex" gutter={16}>
                <Col>
                    <Switch
                        checked={tactical}
                        onChange={(checked)=>this.setState({tactical: checked})}
                        checkedChildren="战术动作"
                        unCheckedChildren="伤害统计"
                    />
                </Col>
                <Col>
                    <Input
                        style={{width: 400}}
                        placeholder="请粘贴reportID，例如: Jzx9tgnTKvVwAX"
                        onChange={event => this.setState({report: event.target.value})}/>
                </Col>
                <Col>
                    <Button onClick={this.submit}>提交</Button>
                </Col>
                {!tactical && <Col><Button onClick={this.downloadExcel}>生成下载链接</Button></Col>}
                {excelDataSource &&  <Col><ExcelFile element={<Button>下载</Button>}>
                    <ExcelSheet data={excelDataSource} name="原始数据">
                        <ExcelColumn label="mark" value="mark"/>
                        <ExcelColumn label="BattleID" value="BattleID"/>
                        <ExcelColumn label="BattleName" value="BattleName"/>
                        <ExcelColumn label="StartTime" value="StartTime"/>
                        <ExcelColumn label="EndTime" value="EndTime"/>
                        <ExcelColumn label="class" value="class"/>
                        <ExcelColumn label="name" value="name"/>
                        <ExcelColumn label="damage-done" value="damage-done"/>
                        <ExcelColumn label="healing" value="healing"/>
                    </ExcelSheet>
                </ExcelFile>
                </Col>}
            </Row>}>
                {tactical ?
                    <TacticalTable
                        loading={loading}
                        tactics={tactics}
                    /> :
                    <Table
                        rowClassName={record => record.type}
                        size="small"
                        loading={loading}
                        dataSource={dataSource}
                        columns={columns}
                        rowKey='id'
                        pagination={false}
                    />
                }
            </Card>
        )
    }
}

export default connect(state=>state.report) (DashboardPage)
