const preset = {
  preset: 'conventionalcommits',
};

module.exports = {
  branches: ['master'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        ...preset,
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        ...preset,
      },
    ],
    [
      '@semantic-release/exec',
      {
        verifyConditionsCmd: 'npm run ci:check',
        prepareCmd: 'npm run build',
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogTitle: '# Changelog\n',
      },
    ],
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
      },
    ],
  ],
};
