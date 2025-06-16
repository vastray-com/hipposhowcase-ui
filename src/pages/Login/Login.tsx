import Logo from '@/assets/icons/logo.svg?react'

import { CenterWrapper } from '@/components/Wrapper.tsx'
import { api } from '@/utils/api.ts'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { App, Button, Form, Input, Space } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FieldType = {
  mobile?: string
  code?: string
}

const LoginPage = () => {
  const { message } = App.useApp()
  const [form] = Form.useForm<FieldType>()
  const [sendCodeColdDown, setSendCodeColdDown] = useState({ canSend: true, time: 0 })

  // 发送验证码
  const sendCode = async () => {
    if (!sendCodeColdDown.canSend) return
    const mobileField = form.getFieldValue('mobile')
    if (!mobileField) {
      await form.validateFields(['mobile'], {})
      return
    }
    const mobile = (mobileField as string).trim()
    if (!mobile) {
      await form.validateFields(['mobile'], {})
      return
    }

    // 发送验证码
    api.login.sendCode({ mobile })
      .then((res) => {
        if (res.code !== 200) {
          console.error('发送验证码失败:', res)
          message.error(res.message || '发送验证码失败')
          return
        }
        console.info('发送验证码成功:', res)
        message.success(res.data || '发送验证码成功')
        setSendCodeColdDown({ canSend: false, time: 60 })
      })
      .catch((e) => {
        console.error('发送验证码失败:', e)
        message.error('发送验证码失败')
      })
  }

  // 倒计时
  useEffect(() => {
    let timer = null

    if (!sendCodeColdDown.canSend) {
      timer = setTimeout(() => {
        if (sendCodeColdDown.time > 0) {
          setSendCodeColdDown(prev => ({ ...prev, time: prev.time - 1 }))
        } else {
          setSendCodeColdDown({ canSend: true, time: 0 })
        }
      }, 1000)
    }

    return () => {
      timer && clearTimeout(timer)
    }
  }, [sendCodeColdDown])

  // 表单提交
  const nav = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const onFinish = async (values: FieldType) => {
    setIsLoading(true)
    api.login.loginWithCode(values as Login.LoginWithCodeParams)
      .then(async (res) => {
        if (res.code !== 200) {
          console.error('登录失败:', res)
          message.error(res.message || '登录失败')
          return
        }

        if (!res.data.token) {
          console.error('登录失败，token 为空:', res)
          message.error('登录失败')
        }

        message.success('登录成功')
        ls.set(LS_KEY.ACCESS_TOKEN, res.data.token)
        ls.set(LS_KEY.SALE, { name: res.data.sale_name, id: res.data.sale_id })
        nav('/select-customer', { replace: true })
      })
      .catch(async (e) => {
        console.error('登录失败:', e)
        message.error('登录失败')
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <CenterWrapper>
      <div className="flex flex-col items-center rounded-1 bg-1 p-[56px] shadow-1">

        <div className="h-[64px] w-[64px] flex items-center justify-center rounded-2 bg-[#333]">
          <Logo className="text-white" />
        </div>

        <Form
          name="login"
          className="mt-[64px]"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
          size="large"
          form={form}
        >
          <Space direction="vertical">
            <Form.Item<FieldType>
              label="手机号"
              name="mobile"
              colon={false}
              rules={[{ required: true, message: '手机号不能为空' }, { whitespace: true, message: '手机号不能为空' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="验证码"
              name="code"
              colon={false}
              rules={[{ required: true, message: '验证码不能为空' }, { whitespace: true, message: '验证码不能为空' }]}
            >
              <Space direction="horizontal">
                <Input />
                <Button size="middle" className="h-[40px] w-[128px] rounded-[8px]" disabled={!sendCodeColdDown.canSend} onClick={sendCode}>
                  {sendCodeColdDown.canSend ? '发送验证码' : `再次发送 ${sendCodeColdDown.time}s`}
                </Button>
              </Space>
            </Form.Item>

            <Button className="btn-solid-black" variant="solid" htmlType="submit" block loading={isLoading}>
              登录
            </Button>
          </Space>
        </Form>
      </div>
    </CenterWrapper>
  )
}

export default LoginPage
