export const InteractionType = {
  PING: 1,
  APPLICATION_COMMAND: 2,
  MESSAGE_COMPONENT: 3,
  APPLICATION_COMMAND_AUTOCOMPLETE: 4,
  MODAL_SUBMIT: 5,
} as const;

export const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
  DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
} as const;

export interface DiscordCommandOption {
  name: string;
  type: number;
  value?: string | number | boolean;
  options?: DiscordCommandOption[];
}

export interface DiscordInteraction {
  type: number;
  id: string;
  token: string;
  data?: {
    name: string;
    options?: DiscordCommandOption[];
  };
}
