onmessage = function (e) {
  const unique = Array.from(new Set(e.data.map((item) => JSON.stringify(item)))).map(
    (item) => JSON.parse(item)
  );
  postMessage(unique);

};
