export type Styles = {
  'botui_action': string;
  'botui_action_container': string;
  'botui_app_container': string;
  'botui_container': string;
  'botui_message': string;
  'botui_message_container': string;
  'botui_message_content': string;
  'botui_message_list': string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
