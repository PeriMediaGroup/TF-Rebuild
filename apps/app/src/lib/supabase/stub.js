const RESOLVE_ERROR = "Supabase not configured";

const asyncErrorResult = (message = RESOLVE_ERROR) =>
  Promise.resolve({ data: null, error: { message } });

const createQueryProxy = (message = RESOLVE_ERROR) => {
  const result = () => ({ data: null, error: { message } });

  const handler = {
    get(_target, prop, receiver) {
      if (prop === "then") {
        return (onFulfilled, onRejected) =>
          Promise.resolve(result()).then(onFulfilled, onRejected);
      }
      if (prop === "catch") {
        return (onRejected) => Promise.resolve(result()).catch(onRejected);
      }
      if (prop === "finally") {
        return (onFinally) => Promise.resolve(result()).finally(onFinally);
      }
      if (prop === Symbol.toStringTag) return "SupabaseQueryStub";
      if (prop === "toString") return () => "[SupabaseQueryStub]";
      return (..._args) => receiver;
    },
  };

  return new Proxy({}, handler);
};

const createChannelStub = (message = RESOLVE_ERROR) => {
  const channel = {
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: () => {},
    toString: () => `[SupabaseChannelStub: ${message}]`,
    get status() {
      return "closed";
    },
  };
  return channel;
};

const createAuthStub = (message = RESOLVE_ERROR) => ({
  signUp: () => asyncErrorResult(message),
  signInWithPassword: () => asyncErrorResult(message),
  signOut: () => asyncErrorResult(message),
  setSession: () => asyncErrorResult(message),
  getSession: () => asyncErrorResult(message),
  getUser: () => asyncErrorResult(message),
  onAuthStateChange: (callback) => {
    if (typeof callback === "function") {
      setTimeout(() => callback("SIGNED_OUT", null), 0);
    }
    const subscription = { unsubscribe: () => {} };
    return {
      data: { subscription },
      error: { message },
    };
  },
  get user() {
    return null;
  },
  get session() {
    return null;
  },
});

const createStorageStub = (message = RESOLVE_ERROR) => ({
  from: () => ({
    upload: () => asyncErrorResult(message),
    createSignedUrl: () => asyncErrorResult(message),
    getPublicUrl: () => ({
      data: { publicUrl: null },
      error: { message },
    }),
    remove: () => asyncErrorResult(message),
    list: () => asyncErrorResult(message),
  }),
});

const createFunctionsStub = (message = RESOLVE_ERROR) => ({
  invoke: () => asyncErrorResult(message),
});

export const createSupabaseStub = (message = RESOLVE_ERROR) => ({
  auth: createAuthStub(message),
  from: () => createQueryProxy(message),
  channel: () => createChannelStub(message),
  removeChannel: () => {},
  storage: createStorageStub(message),
  functions: createFunctionsStub(message),
  isConfigured: () => false,
});

