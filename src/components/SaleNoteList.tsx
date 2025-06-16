import type { FC } from 'react'
import { api } from '@/utils/api.ts'
import { ls, LS_KEY } from '@/utils/localStorage.ts'
import { Divider, Empty, Input, List } from 'antd'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'

type MaskProps = {
  open: boolean
  onClose: () => void
}

const Mask: FC<MaskProps> = ({ open, onClose }) => {
  return (
    <div
      className={
        clsx(
          'z-998 fixed left-0 top-0 w-full h-full inset-0 bg-black transition-opacity transition-ease-in',
          open ? 'opacity-50' : 'opacity-0 pointer-events-none',
        )
      }
      onClick={onClose}
    />
  )
}

type Props = {
  open: boolean
  onClose: () => void
}

export const SaleNoteList: FC<Props> = ({ open, onClose }) => {
  const nav = useNavigate()
  const sale_id = ls.get(LS_KEY.SALE)?.id

  const page_size = 12
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const [keyword, setKeyword] = useState<string>('')

  const [noteList, setNoteList] = useState<Note.List>([])

  // 获取记录列表方法
  const prevKeyword = useRef<string>('')
  const fetchNoteList = useCallback(async (params: Omit<Note.ListParams, 'sale_id'>) => {
    if (!sale_id) return
    try {
      const newParams = { sale_id, ...params }
      // 如果 keyword 变化了，重置页码和记录列表
      if (prevKeyword.current !== params.keyword) newParams.page = 1

      // 请求记录列表
      const res = await api.note.getList(newParams)
      // 更新 prevKeyword 来跟踪当前的 keyword
      prevKeyword.current = newParams.keyword ?? ''
      // 设置当前总数和页码
      setTotal(res.data.total)
      setPage(res.data.page)
      setNoteList((prev) => {
        // 如果是第一页，直接替换记录列表
        if (res.data.page === 1) return res.data.data
        // 否则追加记录列表
        return [...prev, ...res.data.data.filter(item => !prev.some(prevItem => prevItem.id.id.String === item.id.id.String))]
      })
    } catch (e) {
      console.error('获取记录列表失败', e)
    }
  }, [sale_id])

  // 监听 open 状态和搜索参数变化，重新获取记录列表
  useEffect(() => {
    if (!open) return
    fetchNoteList({ keyword, page, page_size })
  }, [open, keyword, page, fetchNoteList])

  const onClickNote = useCallback((note: Note.Item) => {
    // console.info('点击记录', note.id.id.String)
    onClose()
    nav(`/note/${note.id.id.String}`, { state: note.patient_info })
  }, [nav, onClose])

  if (!sale_id) return null

  return (
    <>
      <div
        className={clsx(
          'px-[10px] py-[20px] rounded-2 z-999 fixed top-[16px] left-[16px] h-[calc(100%_-_16px_*_2)] w-[440px] bg-1 transition-transform transition-ease-in',
          open ? 'translate-x-0' : 'translate-x-[-456px]',
        )}
        style={{ background: 'linear-gradient(140.84deg, #F8F3ED 79.38%, #FFB6A3 103.5%)' }}
      >
        <div className="h-full w-full flex flex-col">
          <div className="w-full flex items-center justify-between b-b-1 b-b-[#ccc] b-b-solid px-[10px] pb-[12px]">
            <span className="text-[20px] text-title font-bold">记录列表</span>
            <i className="i-icon-park-outline:close cursor-pointer text-[20px] text-info" onClick={onClose} />
          </div>

          <div className="py-[12px]">
            <Input
              prefix={<i className="i-icon-park-outline:search text-[24px] text-info" />}
              placeholder="客户名称查询"
              size="large"
              onChange={e => setKeyword(e.target.value ?? '')}
            />
          </div>

          {
            noteList.length === 0
              ? (
                  <Empty description="暂无记录" className="mt-[48px]" />
                )
              : (
                  <div id="scrollableDiv" className="w-full flex-1 overflow-auto">
                    <InfiniteScroll
                      dataLength={noteList.length}
                      next={async () => fetchNoteList({ keyword, page: page + 1, page_size })}
                      hasMore={noteList.length < total}
                      endMessage={<Divider plain>没有更多了</Divider>}
                      loader={false}
                      scrollableTarget="scrollableDiv"
                    >
                      <List
                        dataSource={noteList}
                        split={false}
                        renderItem={note => (
                          <List.Item key={note.id.id.String} className="w-full important:pt-0">
                            <div
                              onClick={() => onClickNote(note)}
                              className={clsx('w-full cursor-pointer rounded-1 bg-white text-primary hover:bg-[#6C8EBF] hover:text-white transition transition-duration-75 p-[12px] shadow-1')}
                            >
                              <p className="flex items-center justify-between">
                                <span>{note.title}</span>
                                <span>{note.created_at ? dayjs(note.created_at).format('YYYY/MM/DD HH:mm') : ''}</span>
                              </p>
                              <p className="mt-[4px] opacity-72">
                                <span>姓名：</span>
                                <span>{note.patient_info.user_name}</span>
                                <span className="ml-[12px]">性别：</span>
                                <span>{note.patient_info.gender}</span>
                                <span className="ml-[12px]">年龄：</span>
                                <span>{note.patient_info.age}</span>
                              </p>
                            </div>
                          </List.Item>
                        )}
                      />
                    </InfiniteScroll>
                  </div>
                )
          }
        </div>
      </div>
      <Mask open={open} onClose={onClose} />
    </>
  )
}
