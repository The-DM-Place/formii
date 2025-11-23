const { Schema, model } = require('synz-db');

const applicationTypeSchema = new Schema({
    name: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    description: { type: String, default: '' },
    questions: {
        type: [{
            question: { type: String, required: true },
            type: { type: String, enum: ['text', 'multiple'], default: 'text' },
            limit: { type: Number, default: 1 },
            minChars: { type: Number, default: 0 },
            maxChars: { type: Number },
            extraInfo: { type: String, default: '' },
            options: { type: [String], default: [] }
        }],
        default: []
    },
    acceptedRoleIds: { type: [String], default: [] },
});

// static cool

applicationTypeSchema.statics.getAllTypes = async function () {
    return this.find({});
}

applicationTypeSchema.statics.getTypeById = async function (id) {
    return this.findById(id);
}

applicationTypeSchema.statics.createType = async function (data) {
    const newType = new this(data);
    return newType.save();
}

applicationTypeSchema.statics.deleteType = async function (id) {
    return this.findByIdAndDelete(id);
}

applicationTypeSchema.statics.updateType = async function (id, data) {
    return this.findByIdAndUpdate(id, data, { new: true });
}

applicationTypeSchema.statics.toggleType = async function (id) {
    const type = await this.findById(id);
    if (!type) throw new Error('Application type not found');
    type.enabled = !type.enabled;
    return type.save();
}

applicationTypeSchema.statics.addQuestion = async function (id, question) {
    const type = await this.findById(id);
    if (!type) throw new Error('Application type not found');
    type.questions.push(question);
    return type.save();
}

applicationTypeSchema.statics.removeQuestion = async function (id, questionIndex) {
    const type = await this.findById(id);
    if (!type) throw new Error('Application type not found');
    if (questionIndex < 0 || questionIndex >= type.questions.length) {
        throw new Error('Invalid question index');
    }
    type.questions.splice(questionIndex, 1);
    return type.save();
}

applicationTypeSchema.statics.updateQuestion = async function (id, questionIndex, newQuestion) {
    const type = await this.findById(id);
    if (!type) throw new Error('Application type not found');
    if (questionIndex < 0 || questionIndex >= type.questions.length) {
        throw new Error('Invalid question index');
    }
    type.questions[questionIndex] = newQuestion;
    return type.save();
}

applicationTypeSchema.statics.setAcceptedRoles = async function (id, roleIds) {
    const type = await this.findById(id);
    if (!type) throw new Error('Application type not found');
    type.acceptedRoleIds = Array.isArray(roleIds) ? roleIds : [roleIds];
    return type.save();
}

module.exports = model('ApplicationType', applicationTypeSchema);
