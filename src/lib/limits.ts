// Most copies of a single book one order may contain. Enforced in the cart UI and again on the
// server (checkout validation + order creation), so it cannot be bypassed by calling the API.
export const MAX_QTY_PER_BOOK = 2;
