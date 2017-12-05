const xlsx = require('xlsx');
const path = require('path');
const loc = require('../config/locations.json');
const progs = require('../config/program_mapping.json');

// Path to file
const exPath = path.relative(loc.wdir, loc.fdir);

// Define Regex to seperate run-nr. from id (e.g. "1.M&A" => run: 1, id: M&A)
const runEx = /\d/;
const idEx = /[^.]+$/;

const matchProgram = (program) => {
  let factsheetId = '';
  for (let x = 0; x < progs.length; x += 1) {
    if (progs[x].id === program) {
      ({ factsheetId } = progs[x]);
    }
  }
  return factsheetId;
};

exports.getParticipants = (program, run, cb) => {
  const progId = matchProgram(program);

  // Read Worksheet
  const factSheet = xlsx.readFile(`${exPath}${loc.fname}`);

  // Extract data from worksheet
  const data = xlsx.utils.sheet_to_json(factSheet.Sheets[factSheet.SheetNames[0]], { header: 'A' });

  // Filter prodram id, run and participants from data
  const parts = data.filter((item) => {
    if (item.B === undefined ||
        item.B === 'General Info' ||
        item.B === 'Short' ||
        item.J === undefined) {
      return false;
    }
    return true;
  }).map(item => ({
    id: item.B.match(idEx)[0],
    run: item.B.match(runEx)[0],
    parts: item.J,
  }));
  let participants = 'No applications for this program.';
  for (let x = 0; x < parts.length; x += 1) {
    if (parts[x].id === progId && parts[x].run === run) {
      participants = parts[x].parts;
    }
  }
  return cb(participants);
};
