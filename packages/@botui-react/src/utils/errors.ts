import { IBotUIError } from 'botui'

/**
 * Creates a standardized bot error object
 */
export const createBotUIError = (
  type: IBotUIError['type'],
  message: string,
  options?: {
    cause?: Error
    actionId?: string
  }
): IBotUIError => {
  return {
    type,
    message,
    cause: options?.cause,
    actionId: options?.actionId,
  }
}

/**
 * Utility to create error from caught exceptions
 */
export const errorFromException = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred'
): IBotUIError => {
  if (error instanceof Error) {
    return createBotUIError('unexpected', error.message, { cause: error })
  }

  if (typeof error === 'string') {
    return createBotUIError('unexpected', error)
  }

  return createBotUIError('unexpected', fallbackMessage)
}