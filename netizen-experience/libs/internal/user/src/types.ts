const gptRights = ["prompt", "gptAssistantAdmin", "gptAssistant"] as const;

export const RIGHTS = ["hiring", ...gptRights] as const;
export type Rights = (typeof RIGHTS)[number];
