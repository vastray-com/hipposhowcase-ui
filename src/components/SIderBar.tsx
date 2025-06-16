import Logo from '@/assets/icons/logo.svg?react'
import { SaleNoteList } from '@/components/SaleNoteList.tsx'

import { useModal } from '@/hooks/useModal.tsx'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { Button, Divider, Space } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import { useLocation } from 'react-router'
import { useNavigate } from 'react-router-dom'

export const NavBar = () => {
  const modal = useModal()
  const nav = useNavigate()
  const location = useLocation()

  const [customerRecordListIsVisible, setCustomerRecordListIsVisible] = useState(false)

  const navToSelectCustomer = async () => {
    if (location.pathname !== '/select-customer') {
      nav('/select-customer')
    }
  }

  const logout = async () => {
    modal.confirm({
      title: '退出确认',
      content: '确定退出当前账号吗？',
      onOk: () => {
        ls.rm(LS_KEY.ACCESS_TOKEN)
        ls.rm(LS_KEY.SALE)
        nav('/login', { replace: true })
      },
      okText: '确定退出',
    })
  }

  return (
    <>
      <div className="w-full rounded-3 bg-1 py-[24px] shadow-2">
        <Space className="w-full" direction="vertical" split={<Divider type="horizontal" style={{ margin: '4px 0' }} />}>
          <div className="flex items-center justify-center">
            <Logo />
          </div>

          <div
            className="group w-full flex flex-col cursor-pointer items-center justify-center px-[10px]"
            onClick={navToSelectCustomer}
          >
            <Button
              type="link"
              icon={(
                <i className={clsx('i-icon-park-outline:add-one text-[30px] text-black2  group-hover:text-orange')} />
              )}
            />
            <span className="mt-[6px] group-hover:text-orange">新建问诊</span>
          </div>

          <div
            className="group w-full flex flex-col cursor-pointer items-center justify-center px-[10px]"
            onClick={() => setCustomerRecordListIsVisible(true)}
          >
            <Button
              type="link"
              icon={(
                <i className={clsx('i-icon-park-outline:mindmap-list text-[28px] text-black2 group-hover:text-orange')} />
              )}
            />
            <span className="mt-[6px] group-hover:text-orange">问诊记录</span>
          </div>

          <div className="group pos-relative flex flex-col items-center justify-center px-[10px]">
            <i className={clsx('i-icon-park-outline:user text-[28px] text-black2 group-hover:text-orange')} />
            <p className="mt-[12px] text-black2 group-hover:text-orange">{ls.get(LS_KEY.SALE)?.name ?? ''}</p>

            <div
              className="pos-absolute left-[100%] top-[-10px] z-999 h-[90px] w-[0px] flex items-center justify-center overflow-hidden opacity-0 transition-all group-hover:w-[260px] group-hover:opacity-100"
            >
              <div className="h-[84px] w-[240px] flex items-center justify-center rounded-1 bg-white shadow-1">
                <Button variant="solid" className="h-[52px] w-[220px] btn-solid-aux2" onClick={logout}>退出登录</Button>
              </div>
            </div>
          </div>
        </Space>
      </div>

      <SaleNoteList open={customerRecordListIsVisible} onClose={() => setCustomerRecordListIsVisible(false)} />
    </>
  )
}
