export const setCustomerTokenHeader = (res, tokens) => {
    if (tokens?.accessToken) {
        res.setHeader("accessToken", tokens.accessToken);
    }
    if (tokens?.refreshToken) {
        res.setHeader("refreshToken", tokens.refreshToken);
    }
};

export const clearCustomerTokenHeader = (res) => {
    res.removeHeader("accessToken");
    res.removeHeader("refreshToken");
};
