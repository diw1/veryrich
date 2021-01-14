import React, {Component} from 'react'
import {Table} from 'antd'

class TacticalTable extends Component{

    render() {
        const dataSource =  this.props.tactics
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
                title: '构造区',
                children: [
                    {
                        title: '胖子+软泥',
                        children: [
                            {
                                title: '致密伤害',
                                dataIndex: 'dense1',
                            },
                            {
                                title: '帽子伤害',
                                dataIndex: 'hat',
                            },
                        ]
                    },
                    {
                        title: '电男死愿/冲动',
                        dataIndex: 'deathwish1',
                    },
                ]
            },
            {
                title: '瘟疫区',
                children: [
                    {
                        title: '诺斯滋补',
                        dataIndex: 'resto',
                        render: (text, item)=> item.resto ? '有诅咒没吃滋补':'没问题'
                    },
                    {
                        title: '跳舞男迅捷鞋',
                        dataIndex: 'swiftBoot',
                    },
                    {
                        title: '孢子死愿/冲动',
                        dataIndex: 'deathwish2',
                    },
                ]
            },
            {
                title: '军事区',
                children: [
                    {
                        title: '邪恶武器石盾',
                        dataIndex: 'stoneShield',
                        render: (text, item)=> item.stoneShield ? '1':'0'
                    },
                    {
                        title: '4DK暗抗',
                        dataIndex: 'darkres',
                    },
                    {
                        title: '4DK鲁莽/乱舞',
                        dataIndex: 'recklessness',
                    },
                    {
                        title: '4DK死愿/冲动',
                        dataIndex: 'deathwish3',
                    },
                ]
            },
            {
                title: '蜘蛛区',
                children: [
                    {
                        title: '自然抗',
                        dataIndex: 'natureres',
                        render: (text, item)=> item.natureres ? '有自然抗或没受伤害': '可能没有(需复查)'
                    },
                    {
                        title: '蜘蛛1火箭鞋',
                        dataIndex: 'rocketBoot',
                    },
                    {
                        title: '侍僧暗吸',
                        dataIndex: 'darkAbsorb',
                        render: (text, item)=> item.darkAbsorb ? '有':'没有'
                    },
                    {
                        title: '侍僧地精工兵',
                        dataIndex: 'sapper',
                    },
                ]
            },
            {
                title: '中心区',
                children: [
                    {
                        title: '冰龙暗抗吸收',
                        dataIndex: 'darkres2',
                        render: (text, item)=> !item.darkres2 && '没有'
                    },
                    {
                        title: '冰龙死愿',
                        dataIndex: 'deathwish4',
                    },
                    {
                        title: '老克冰抗',
                        dataIndex: 'iceres',
                    },
                    {
                        title: '老克打断',
                        dataIndex: 'interrupt2',
                    },
                ]
            },


            // {
            //     title: '总分',
            //     dataIndex: 'finalDamage',
            //     sorter: (a, b) => a.finalDamage-b.finalDamage,
            //     defaultSortOrder: 'descend',
            // },
            // {
            //     title: '百分比',
            //     dataIndex: 'finalScore',
            // },
        ]
        return (
            <Table
                rowClassName={record=>record.type}
                size="small"
                loading={this.props.loading}
                dataSource={dataSource}
                columns={columns}
                rowKey='id'
                pagination={false}
            />

        )
    }
}

export default TacticalTable
