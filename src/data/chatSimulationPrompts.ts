export interface ChatSimulationPrompt {
  id: string;
  topic: 'Order Status' | 'Billing / Refund' | 'Promos & Meals';
  title: string;
  customerPersona: string;
  openingMessage: string;
  scriptedReplies: string[];
  wrapUpMessage: string;
  coachingTips: string[];
}

export const CHAT_SIMULATION_PROMPTS: ChatSimulationPrompt[] = [
  {
    id: 'chat-order-status',
    topic: 'Order Status',
    title: 'Delayed Order Check-In',
    customerPersona: 'Customer checking on an order past the initial delivery window',
    openingMessage:
      'Hi, my order was supposed to arrive earlier today and chat still says it is on the way. Can you check what is happening?',
    scriptedReplies: [
      'Okay, thanks for checking. Do you know if it will definitely make it tonight or should I expect it tomorrow?',
      'Got it, that makes sense. If it gets delayed again, what happens next?',
    ],
    wrapUpMessage:
      'Alright, thank you for explaining that clearly. I appreciate the help!',
    coachingTips: [
      'Acknowledge the wait time warmly before looking up details.',
      'Explain the current status plainly without promising an unconfirmed arrival time.',
      'Share clear next steps in case the delivery window shifts.',
    ],
  },
  {
    id: 'chat-payment-billing',
    topic: 'Billing / Refund',
    title: 'Card Payment & Refund Timeline',
    customerPersona: 'Customer asking about credit card payment and refund processing',
    openingMessage:
      'Hello! Can I pay with a credit card on this order, and how long does a refund take if I need to cancel?',
    scriptedReplies: [
      'Thanks. And if a partial refund is issued to that card, will I see it right away or after a few days?',
      'Okay, good to know. Let me double-check my cart before I decide.',
    ],
    wrapUpMessage:
      'That answers my question—thanks for walking me through it!',
    coachingTips: [
      'Answer the payment question directly first.',
      'Set realistic expectations for refund processing windows.',
      'Ask if they need help with anything else on their order.',
    ],
  },
  {
    id: 'chat-promos-group-meals',
    topic: 'Promos & Meals',
    title: 'Promo vs. Group Meal & BOGO Options',
    customerPersona: 'Customer comparing promo deals, group meal bundles, and BOGO items',
    openingMessage:
      'Skip the promo code for a second—do you have group meals or buy-one-take-one options available right now?',
    scriptedReplies: [
      'Nice, that sounds helpful for a group. Can I mix and match or does it have to be the exact bundle?',
      'Makes sense. Let me check with the others on what they want.',
    ],
    wrapUpMessage:
      'Awesome, thanks for the clear options!',
    coachingTips: [
      'Follow the customer’s lead and highlight group meal or BOGO options clearly.',
      'Clarify any bundle or selection rules simply so they can choose easily.',
    ],
  },
];
