import type { ResultProps } from 'antd/es/result'
import { CenterWrapper } from '@/components/Wrapper.tsx'
import { Button, Result, Space } from 'antd'
import { NavLink, useNavigate } from 'react-router-dom'

const BackBtn = () => {
  const nav = useNavigate()
  return (
    <Button color="default" variant="filled" onClick={async () => nav(-1)}>
      返回上级
    </Button>
  )
}

const HomeBtn = () => {
  return (
    <NavLink to="/" replace>
      <Button color="default" variant="solid">
        返回首页
      </Button>
    </NavLink>
  )
}

const NotFound = () => (
  <CenterWrapper>
    <Result
      title="404"
      subTitle="页面未找到，请检查地址是否正确"
      icon={null}
      extra={(
        <Space>
          <BackBtn />
          <HomeBtn />
        </Space>
      )}
    />
  </CenterWrapper>
)

export const ResultPage = (props: ResultProps) => <Result {...props} />
ResultPage.NotFound = NotFound
