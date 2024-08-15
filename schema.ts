import { z } from "zod";

export const NEW_BOARD_SCHEMA = z.object({
  username: z
    .string({ required_error: "Enter a username!" })
    .min(4, { message: "At least 4 characters!" }),
  symbol: z.string({ required_error: "Select a symbol" }).length(1),
});


