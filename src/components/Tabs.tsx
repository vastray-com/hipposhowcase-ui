import type { FC, ReactNode } from 'react'
import { Tabs } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'

export type MyTabsItem = {
  key: string
  label: string
  render: ReactNode
}
export type MyTabsItems = MyTabsItem[]

type Props = {
  items: MyTabsItems
  defaultActiveKey?: string
}

export const MyTabs: FC<Props> = ({ items, defaultActiveKey }) => {
  // 处理 Tab 切换
  const [currentTab, setCurrentTab] = useState<string>(defaultActiveKey ?? items[0].key)

  return (
    <div style={{ height: '100%' }}>
      <Tabs activeKey={currentTab} onChange={k => setCurrentTab(k)} items={items.map(item => ({ label: item.label, key: item.key }))} />
      <div className="h-[calc(100%_-_46px_-_16px)] overflow-y-auto">
        {
          items.length > 0 && items.map(item => (
            <div key={item.key} className={clsx('h-full', currentTab === item.key ? 'visible' : 'hidden')}>
              {item.render}
            </div>
          ))
        }
      </div>
    </div>
  )
}
