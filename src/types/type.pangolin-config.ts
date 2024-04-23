export interface IPangolinConfig {
  language: string;
  botname: string;
  admins: string[];
  prefix: string;
  commands: {
    youtube_search_api: string;
  };
  access_token: string;
  log_event: boolean;
  help_paginate: boolean;
  noti_loaded_data: boolean;
}
