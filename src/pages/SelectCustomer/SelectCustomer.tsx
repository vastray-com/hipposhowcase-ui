import { NEW_NOTE_ID } from '@/constant'
import { api } from '@/utils/api.ts'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { Button, Card, Empty, Form, Input } from 'antd'
import clsx from 'clsx'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FieldType = {
  keyword?: string
}

const SelectCustomerPage = () => {
  const nav = useNavigate()

  const [keyword, setKeyword] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)

  const [openResult, setOpenResult] = useState<boolean>(false)
  const [customerList, setCustomerList] = useState<Customer.List>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer.Item | null>(null)

  const onConfirm = (c: Customer.Item) => {
    // const newId = crypto.randomUUID()
    const customer: Customer.InternalItem = {
      age: c.age,
      gender: c.gender,
      sale_id: c.saleId,
      sale_name: c.saleName,
      total_consumption: c.totalConsumption,
      user_id: c.userId,
      user_level: c.userLevel,
      user_name: c.userName,
    }
    nav(`/note/${NEW_NOTE_ID}`, { state: customer })
  }

  const onClickCustomer = useCallback((c: Customer.Item) => {
    if (selectedCustomer?.userId === c.userId) {
      return setSelectedCustomer(null)
    }
    setSelectedCustomer(c)
  }, [selectedCustomer])

  const onSearch = async (v: FieldType) => {
    const sale = ls.get(LS_KEY.SALE)
    if (!sale) return

    const trimK = v.keyword?.trim()
    if (!trimK) return

    setOpenResult(false)
    setIsSearching(true)
    setCustomerList([])
    setSelectedCustomer(null)
    const list = await api.customer.search(sale.id, trimK)
    if (list.code === 200) {
      setCustomerList(list.data)
      setOpenResult(true)
    } else {
      setOpenResult(false)
    }
    setIsSearching(false)
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="pos-relative w-[700px] flex items-center justify-center overflow-hidden">
        <Card className="z-100 w-[320px] pt-[24px] shadow-1">
          <Form
            name="search-customer"
            initialValues={{ remember: true }}
            onFinish={onSearch}
            autoComplete="off"
            requiredMark={false}
            size="large"
          >
            <Form.Item<FieldType>
              label="客户姓名"
              name="keyword"
              rules={[{ required: true, message: '请输入客户姓名' }, { whitespace: true, message: '请输入客户姓名' }]}
            >
              <Input onChange={e => setKeyword(e.target.value)} />
            </Form.Item>

            <Form.Item<FieldType>>
              <Button
                htmlType="submit"
                iconPosition="end"
                icon={<i className="i-icon-park-outline:search text-[18px]" />}
                block
                disabled={keyword.trim() === ''}
                loading={isSearching}
              >
                查询
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <div className={clsx('pos-relative h-[420px] w-[380px] transition-all', openResult ? 'w-[420px]' : 'w-0')}>
          <Card
            className={clsx('pos-absolute shadow-1 h-[400px] w-[360px] top-0 right-[10px] bg-white transition-all', openResult ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
            title="客户列表"
            extra={(
              <Button
                type="text"
                icon={<i className="i-icon-park-outline:close" onClick={() => setOpenResult(false)} />}
              />
            )}
          >
            <div className="mb-[16px] max-h-[250px] overflow-auto">
              {
                customerList.length > 0
                  ? (
                      <ul className="pr-[4px]">
                        {
                          customerList.map(customer => (
                            <li
                              key={customer.userId}
                              onClick={() => onClickCustomer(customer)}
                              className={clsx(selectedCustomer?.userId === customer.userId ? 'bg-[#6C8EBF] color-white' : 'bg-white hover:bg-[#f5f5f5]', 'mb-[8px] rounded-1 shadow-1 flex items-center justify-between p-[8px] cursor-pointer')}
                            >
                              <span className="w-[33%]">{customer.userName}</span>
                              <span className="w-[33%] text-center">{`${customer.age}岁`}</span>
                              <span className="w-[33%] text-end">{customer.gender}</span>
                            </li>
                          ))
                        }
                      </ul>
                    )
                  : <Empty description="未找到对应客户" />
              }
            </div>

            <Button
              className="btn-solid-black"
              variant="solid"
              block
              size="large"
              disabled={!selectedCustomer}
              onClick={() => selectedCustomer && onConfirm(selectedCustomer)}
            >
              开始问诊
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SelectCustomerPage
