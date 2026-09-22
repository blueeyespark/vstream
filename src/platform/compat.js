import { auth } from "./auth";
import { data } from "./entities";
import { platform } from "./client";

const Core = {
  InvokeLLM: (request) => platform.ai.generate(request),
  UploadFile: (request) => platform.storage.upload(request),
  GenerateImage: (request) => platform.media.generateImage(request),
};

export const blue = {
  auth,
  entities: data,
  functions: platform.functions,
  integrations: { Core },
  appLogs: {
    logUserInApp: (page) => data.ActivityLog.create({ type: "navigation", page }),
  },
};
