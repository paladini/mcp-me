async function fetchPyPIUserPackages(username) {
  const resp = await fetch(`https://pypi.org/user/${username}/`);
  if (!resp.ok) {
    if (resp.status === 404) throw new Error(`PyPI user "${username}" not found`);
    throw new Error(`PyPI HTTP error: ${resp.status}`);
  }
  const html = await resp.text();
  const regex = /<h3 class="package-snippet__title">([^<]+)<\/h3>/g;
  const packages = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    packages.push(match[1]);
  }
  return packages;
}

fetchPyPIUserPackages("tiangolo").then(console.log).catch(console.error);
