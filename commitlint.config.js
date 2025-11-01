export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0], 
    'header-max-length': [2, 'always', 120],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^(?:([A-Z]+-\d+)\s+)?([a-z]+)(?:\(([^)]*)\))?: (.*)$/,
      headerCorrespondence: ['ticket', 'type', 'scope', 'subject']
    }
  }
};
