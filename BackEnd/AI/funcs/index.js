// ./AI/funcs/index.js

const callAiFuncUsingLocalFunc = require('./call_ai_func_using_localfunc').callAiFuncUsingLocalFunc;
const callAiFuncUsingWeb = require('./call_ai_func_using_web').callAiFuncUsingWeb;
const callAiLocalFuncFileArg = require('./call_ai_local_func_file_arg').callAiLocalFuncFileArg;
const wavProcess = require('./wav_process').wavProcess;
const callAiFuncUsingSTTAbstractLocalFunc = require('./call_python_stt_abstract').callAiFuncUsingSTTAbstractLocalFunc
const stt_abstract = require('./call_python_stt_abstract').stt_abstract;

module.exports = {
    callAiFuncUsingLocalFunc,
    callAiFuncUsingWeb,
    callAiLocalFuncFileArg,
    callAiFuncUsingSTTAbstractLocalFunc,
    wavProcess
};
