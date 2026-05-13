

exports.generateMatric = async (facultyId) => {
  const year = new Date().getFullYear();
  const faculty = await Faculty.findById(facultyId);
  if (!faculty) {
    throw new Error("Faculty not found");
  }
  
  const facultyCode = faculty.code;

 
  const validFaculties = [
    "SCI",
    "ENG",
    "ART",
    "MGT",
    "EDU",
    "LAW",
    "MED",
    "SOS",
  ];
  if (!validFaculties.includes(facultyCode.toUpperCase())) {
    throw new Error(`Invalid faculty code: ${facultyCode}`);
  }

  facultyCode = facultyCode.toUpperCase();

  let counter = await Counter.findOne({ facultyCode, year });

  if (!counter) {
    counter = await Counter.create({
      facultyCode,
      year,
      count: 1,
    });
  } else {
    counter.count += 1;
    await counter.save();
  }

  
  const serialNumber = String(counter.count).padStart(5, "0");

  return `${facultyCode}/${year}/${serialNumber}`;
};
