const { Schema, model } = require('synz-db');

const moderatorQuestions = [
    'Why do you want to be a moderator?',
    'How old are you?',
    'How long have you been in the server?',
    'What is your current level in the server?',
    'How many warnings do you have?',
    'Do you have 2FA enabled on your Discord account?',
    'How would you handle a user breaking the rules?',
    'How would you help keep the community safe and friendly?',
    'Do you have any prior moderation experience? If so, where?',
    'Anything else you want to add?'
];

const moderatorAppType = {
    name: 'Moderator',
    enabled: true,
    description: 'Moderators help keep the server and community safe, enforcing rules and ensuring a friendly environment.',
    questions: moderatorQuestions,
    acceptedRoleIds: ['MODERATOR_ROLE_ID'],
};

module.exports = moderatorAppType;
