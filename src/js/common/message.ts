/**
 * @module message
 */

import { ActionType } from './action';
import { DecodedItem } from './decode';

type EncodeAction =
  // Encode tab link
  | ActionType.ENCODE_TAB_LINK
  // Encode select link
  | ActionType.ENCODE_SELECT_LINK
  // Encode selection text
  | ActionType.ENCODE_SELECTION_TEXT;

type DecodeAction =
  // Decode select image
  | ActionType.DECODE_SELECT_IMAGE
  // Decode select capture area
  | ActionType.DECODE_SELECT_CAPTURE_AREA;

export interface EncodeTextOk {
  type: 'ok';
  payload: string;
  action: EncodeAction;
}

export interface DecodeImageOk {
  type: 'ok';
  action: DecodeAction;
  payload: {
    image: string;
    decoded: DecodedItem[];
  };
}

export interface EncodeTextError {
  type: 'error';
  message: string;
  action: EncodeAction;
}

export interface DecodeImageError {
  type: 'error';
  message: string;
  action: DecodeAction;
}

export function sendRequest<M, R>(message: M): Promise<R | null> {
  return chrome.runtime.sendMessage<M, R | null>(message).then(
    response => {
      return response ?? null;
    },
    error => {
      if (__DEV__) {
        console.error(error);
      }

      return null;
    }
  );
}

export function sendResponse<M, R>(tabId: number, message: M): Promise<R | null> {
  return chrome.tabs.sendMessage(tabId, message).then(
    response => {
      return response ?? null;
    },
    error => {
      if (__DEV__) {
        console.error(error);
      }

      return null;
    }
  );
}
