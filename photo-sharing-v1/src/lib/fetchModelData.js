// // /**
// //  * fetchModel - Fetch a model from the web server.
// //  *
// //  * @param {string} url      The URL to issue the GET request.
// //  *
// //  */
// // function fetchModel(url) {
// //   const models = null;
// //   return models;
// // }

// // export default fetchModel;

// /**
//  * fetchModel - Fetch a model from the web server.
//  *
//  * @param {string} url The URL to issue the GET request (e.g. "/user/list")
//  * @returns {Promise<any>} Promise resolving to the JSON model
//  */
// function fetchModel(url) {
//   return fetch(url, { method: "GET" }).then((response) => {
//     if (!response.ok) {
//       return response.text().then((text) => {
//         throw new Error(text || `HTTP ${response.status}`);
//       });
//     }
//     return response.json();
//   });
// }

// export default fetchModel;

function fetchModel(url, options = {}) {
  const merged = {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };

  return fetch(url, merged).then(async (response) => {
    if (!response.ok) {
      const text = await response.text();
      const err = new Error(text || `HTTP ${response.status}`);
      err.status = response.status;
      throw err;
    }

    // Some endpoints may return empty body
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }
    return response.text();
  });
}

export default fetchModel;
