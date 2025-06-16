import type { ReactNode } from 'react'
import { App } from 'antd'

type ConfirmProps = {
  title?: string
  content?: ReactNode
  okText?: string
  cancelText?: string
  onOk?: () => void
  onCancel?: () => void
  footer?: null | ReactNode
}

export const useModal = () => {
  const { modal } = App.useApp()

  const confirm = (props: ConfirmProps) => {
    return modal.confirm({
      width: 440,
      centered: true,
      icon: null,
      closable: true,
      destroyOnClose: true,
      okText: props.okText || '确认',
      cancelText: props.cancelText || '取消',
      cancelButtonProps: {
        className: 'w-[50%] btn-solid-gray',
        size: 'large',
        variant: 'solid',
      },
      footer: props.footer === undefined
        ? (_, { OkBtn, CancelBtn }) => {
            return (
              <div className="w-full flex items-center justify-between">
                <CancelBtn />
                <OkBtn />
              </div>
            )
          }
        : props.footer === null ? null : props.footer,
      okButtonProps: {
        className: 'w-[50%] btn-solid-aux2',
        size: 'large',
      },
      ...props,
    })
  }

  return {
    confirm,
  }
}
