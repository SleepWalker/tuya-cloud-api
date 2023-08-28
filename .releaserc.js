const preset = {
  preset: 'conventionalcommits',
  releaseRules: [
    // support adding "!" suffix to trigger breaking (major) release
    { breaking: true, release: 'major' },
    { type: 'feature', release: 'minor' },
    { type: 'ref', release: 'patch' },
    // the other rules (e.g. feat, fix, perf) are defined here:
    // https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
  ],
  presetConfig: {
    types: [
      { type: 'feat', section: 'Features' },
      { type: 'feature', section: 'Features' },
      { type: 'fix', section: 'Bug Fixes' },
      { type: 'perf', section: 'Performance Improvements' },
      { type: 'revert', section: 'Reverts' },
      { type: 'refactor', section: 'Code Refactoring' },
      { type: 'ref', section: 'Code Refactoring' },
      { type: 'docs', section: 'Documentation', hidden: true },
      { type: 'style', section: 'Styles', hidden: true },
      { type: 'chore', section: 'Miscellaneous Chores', hidden: true },
      { type: 'test', section: 'Tests', hidden: true },
      { type: 'build', section: 'Build System', hidden: true },
      { type: 'ci', section: 'Continuous Integration', hidden: true },
    ],
  },
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
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
      },
    ],
  ],
};
