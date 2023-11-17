module.exports = {
  getParamData: (paramData, url_segment) => {
    let paramKeys = Object.keys(paramData);
    let paramValue = Object.values(paramData);

    let paramQuery = url_segment + "?";

    for (let i = 0; i < Object.keys(paramData).length; i++) {
      paramQuery += paramKeys[i] + "=" + paramValue[i] + "&";
    }
    paramQuery = paramQuery.substring(0, paramQuery.length - 1);
    return paramQuery;
  },
};
