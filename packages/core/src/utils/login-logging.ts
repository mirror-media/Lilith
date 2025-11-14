/**
 * 創建登入日誌插件
 * 用於記錄用戶登入事件
 */
export function createLoginLoggingPlugin(): any {
  return {
    async requestDidStart() {
      let isLoginMutation = false
      let requestHttp: any = null

      return {
        async didResolveOperation(requestContext: any) {
          // 檢查是否為登入 mutation
          const operationName =
            requestContext.request.operationName ||
            requestContext.operation?.name?.value
          isLoginMutation =
            operationName === 'authenticateUserWithPassword' ||
            requestContext.document?.definitions.some(
              (def: any) =>
                def.kind === 'OperationDefinition' &&
                def.operation === 'mutation' &&
                def.selectionSet?.selections?.some(
                  (sel: any) =>
                    sel.name?.value === 'authenticateUserWithPassword'
                )
            )
          requestHttp = requestContext.request.http
        },
        async willSendResponse(requestContext: any) {
          try {
            if (isLoginMutation) {
              // 嘗試多種方式獲取響應數據
              const body = requestContext.response.body as any
              let result = null

              // 嘗試不同的響應結構
              if (body?.singleResult?.data) {
                result = body.singleResult.data
              } else if (body?.kind === 'single' && body.singleResult?.data) {
                result = body.singleResult.data
              } else if (body?.data) {
                result = body.data
              } else if (
                typeof body === 'object' &&
                'data' in body &&
                body.data
              ) {
                result = body.data
              }

              // 檢查 authenticate 或 authenticateUserWithPassword
              const authResult =
                result?.authenticate || result?.authenticateUserWithPassword

              if (authResult) {
                // 檢查是否為成功登入
                if (
                  authResult.__typename === 'UserAuthenticationWithPasswordSuccess'
                ) {
                  const user = authResult.item
                  const userId = user.id

                  // 通過 context 查詢完整的用戶信息
                  let userInfo = {
                    id: userId,
                    email: user.email || null,
                    name: user.name || null,
                    role: user.role || null,
                  }

                  try {
                    // 如果響應中沒有完整信息，通過 context 查詢
                    if (!user.email || !user.name || !user.role) {
                      const context = requestContext.contextValue as any

                      // 嘗試多種方式訪問 context
                      let fullUser = null

                      // 方式 1: 通過 query API
                      if (context?.query?.User?.findOne) {
                        try {
                          fullUser = await context.query.User.findOne({
                            where: { id: userId },
                            query: 'id email name role',
                          })
                        } catch (e) {
                          console.error('[登入日誌] query.User.findOne 錯誤:', e)
                        }
                      }

                      // 方式 2: 通過 Prisma 直接查詢
                      if (!fullUser && context?.prisma?.User?.findUnique) {
                        try {
                          fullUser = await context.prisma.User.findUnique({
                            where: { id: parseInt(userId) },
                            select: { id: true, email: true, name: true, role: true },
                          })
                        } catch (e) {
                          console.error('[登入日誌] prisma.User.findUnique 錯誤:', e)
                        }
                      }

                      // 方式 3: 嘗試其他 context 路徑
                      if (!fullUser && context?.db?.User?.findOne) {
                        try {
                          fullUser = await context.db.User.findOne({
                            where: { id: userId },
                            query: 'id email name role',
                          })
                        } catch (e) {
                          console.error('[登入日誌] db.User.findOne 錯誤:', e)
                        }
                      }

                      if (fullUser) {
                        userInfo = {
                          id: fullUser.id,
                          email: fullUser.email || null,
                          name: fullUser.name || null,
                          role: fullUser.role || null,
                        }
                      } else {
                        // 調試：打印 context 結構
                        console.log('[登入日誌] 無法查詢用戶信息，context 結構:', {
                          hasContextValue: !!context,
                          hasQuery: !!context?.query,
                          hasPrisma: !!context?.prisma,
                          hasDb: !!context?.db,
                          contextKeys: context ? Object.keys(context) : [],
                        })
                      }
                    }
                  } catch (queryError) {
                    console.error('[登入日誌] 查詢用戶信息錯誤:', queryError)
                  }

                  // 獲取 IP 地址
                  let ipAddress =
                    requestHttp?.headers
                      ?.get('x-forwarded-for')
                      ?.split(',')[0]?.trim() ||
                    requestHttp?.headers?.get('x-real-ip') ||
                    requestHttp?.socket?.remoteAddress ||
                    'unknown'

                  // 將 IPv6 localhost 轉換為 IPv4
                  if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
                    ipAddress = '127.0.0.1'
                  }

                  console.log('[登入日誌]', {
                    timestamp: new Date().toISOString(),
                    userId: userInfo.id,
                    email: userInfo.email || 'N/A',
                    name: userInfo.name || 'N/A',
                    role: userInfo.role || 'N/A',
                    ipAddress,
                  })
                } else if (
                  authResult.__typename === 'UserAuthenticationWithPasswordFailure'
                ) {
                  console.log('[登入日誌] 登入失敗:', authResult.message)
                }
              }
            }
          } catch (error) {
            console.error('[登入日誌錯誤]', error)
            if (error instanceof Error) {
              console.error('[登入日誌錯誤] Stack:', error.stack)
            }
          }
        },
      }
    },
  }
}

