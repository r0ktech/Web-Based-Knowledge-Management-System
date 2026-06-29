import { PrismaClient, Role, DocStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LGAs = [
  'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 
  'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 
  'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 
  'Umuahia North', 'Umuahia South', 'Umunneochi'
];

const PARTIES = ['PDP', 'APC', 'APGA', 'LP', 'PPA', 'NPN', 'SDP'];

const FIRST_NAMES = [
  'Orji', 'Okezie', 'Alex', 'Theodore', 'Enyinnaya', 'Nkechi', 'Uche', 'Chinedum',
  'Arunma', 'Ngozi', 'Okechukwu', 'Ikemba', 'Chinedu', 'Kanayo', 'Obinna', 'Kalu',
  'Amara', 'Emeka', 'Chinwe', 'Uzoma', 'Ifeanyi', 'Barth', 'Collyns', 'Nwabueze',
  'Chibuike', 'Ebere', 'Ndukwe', 'Ezenwa', 'Chidi', 'Ada', 'Onyinye', 'Chimdi'
];

const LAST_NAMES = [
  'Kalu', 'Ikpeazu', 'Otti', 'Orji', 'Abaribe', 'Nwachukwu', 'Ogah', 'Iheanacho',
  'Oteh', 'Okonjo', 'Adighije', 'Chukwu', 'Nwabara', 'Okereke', 'Nwosu', 'Kanu',
  'Mba', 'Nwajie', 'Anyanwu', 'Nduka', 'Onuoha', 'Uche', 'Eze', 'Okoronkwo',
  'Ogbulafor', 'Elechi', 'Ubani', 'Akomas', 'Osondu', 'Nwankwo', 'Erondu', 'Ukaegbu'
];

const LEADERSHIP_POSITIONS = [
  'Governor', 'Deputy Governor', 'Commissioner', 'Speaker of House', 'Senator',
  'Minister', 'Traditional Ruler', 'Chief of Staff', 'Special Adviser', 'LGA Chairman'
];

const OFFICES = [
  'Executive Office of the Governor', 'Office of the Deputy Governor',
  'Ministry of Finance', 'Ministry of Works & Infrastructure', 'Ministry of Education',
  'Ministry of Health', 'Ministry of Agriculture', 'State House of Assembly',
  'Senate Chamber', 'Federal Ministry of Finance'
];

async function main() {
  console.log('Starting migration seeding...');

  // Clean old records
  await prisma.auditLog.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.leaderEventRelation.deleteMany({});
  await prisma.historicalEvent.deleteMany({});
  await prisma.leader.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('Password123', 10);

  // 1. Generate 100 Users
  console.log('Seeding 100 Users...');
  const usersData: any[] = [];
  const rolesList = Object.values(Role);

  // Create standard admin list first
  const admins = [
    { email: 'superadmin@abia.gov.ng', name: 'Super Admin', role: Role.SUPER_ADMIN },
    { email: 'admin@abia.gov.ng', name: 'Alhaji Victor Kalu', role: Role.ADMINISTRATOR },
    { email: 'historian@abia.gov.ng', name: 'Dr. Chinwe Mba', role: Role.HISTORIAN },
    { email: 'researcher@abia.gov.ng', name: 'Prof. Obinna Nwosu', role: Role.RESEARCHER },
    { email: 'editor@abia.gov.ng', name: 'Amara Kanu', role: Role.EDITOR },
    { email: 'contributor@abia.gov.ng', name: 'Chidi Okereke', role: Role.CONTRIBUTOR },
    { email: 'guest@abia.gov.ng', name: 'Ada Anyanwu', role: Role.GUEST }
  ];

  for (const admin of admins) {
    const user = await prisma.user.create({
      data: {
        email: admin.email,
        passwordHash,
        name: admin.name,
        role: admin.role,
        profile: {
          create: {
            stateOfOrigin: 'Abia State',
            lga: LGAs[Math.floor(Math.random() * LGAs.length)],
            biography: `Profile of system user ${admin.name} serving as ${admin.role}.`,
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${admin.name}`
          }
        }
      }
    });
    usersData.push(user);
  }

  // Generate the rest up to 100 users
  for (let i = usersData.length + 1; i <= 100; i++) {
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${fName} ${lName}`;
    const role = rolesList[Math.floor(Math.random() * rolesList.length)];
    const email = `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@abia-kms.net`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        profile: {
          create: {
            stateOfOrigin: Math.random() > 0.1 ? 'Abia State' : 'Imo State',
            lga: LGAs[Math.floor(Math.random() * LGAs.length)],
            biography: `Active user ${name} registered in Abia KMS. Supporting documentation and archival research in local histories.`,
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name}`
          }
        }
      }
    });
    usersData.push(user);
  }

  const creatorId = usersData[0].id; // Super admin standard creator

  // 2. Generate 100 Leaders
  console.log('Seeding 100 Leaders...');
  const leadersList: any[] = [];
  
  // Real Governors list of Abia State
  const governors = [
    { name: 'Frank Ajobena', party: 'Military', start: new Date('1991-08-28'), end: new Date('1992-01-02'), pos: 'Military Governor' },
    { name: 'Ogbonnaya Onu', party: 'NRC', start: new Date('1992-01-02'), end: new Date('1993-11-17'), pos: 'Executive Governor' },
    { name: 'Chinyere Ike Nwosu', party: 'Military', start: new Date('1993-12-09'), end: new Date('1994-09-14'), pos: 'Military Administrator' },
    { name: 'Temi Ejoor', party: 'Military', start: new Date('1994-09-14'), end: new Date('1996-08-22'), pos: 'Military Administrator' },
    { name: 'Moses Fasanya', party: 'Military', start: new Date('1996-08-22'), end: new Date('1998-08-11'), pos: 'Military Administrator' },
    { name: 'Anthony Obi', party: 'Military', start: new Date('1998-08-11'), end: new Date('1999-05-29'), pos: 'Military Administrator' },
    { name: 'Orji Uzor Kalu', party: 'PDP', start: new Date('1999-05-29'), end: new Date('2007-05-29'), pos: 'Executive Governor' },
    { name: 'Theodore A. Orji', party: 'PPA', start: new Date('2007-05-29'), end: new Date('2015-05-29'), pos: 'Executive Governor' },
    { name: 'Okezie Ikpeazu', party: 'PDP', start: new Date('2015-05-29'), end: new Date('2023-05-29'), pos: 'Executive Governor' },
    { name: 'Alex Otti', party: 'LP', start: new Date('2023-05-29'), end: new Date('2027-05-29'), pos: 'Executive Governor' }
  ];

  let predecessorId: string | null = null;
  for (const gov of governors) {
    const leader = await prisma.leader.create({
      data: {
        fullName: gov.name,
        politicalParty: gov.party,
        position: gov.pos,
        officeHeld: 'Executive Governor of Abia State',
        startDate: gov.start,
        endDate: gov.end,
        biography: `${gov.name} served as the Governor of Abia State. Driven by goals of community updates, infrastructure restoration, agricultural expansion, and state safety. Under this tenancy, key administrative and public developments were charted across the 17 local government areas.`,
        achievements: `Successfully led governance modules, commissioned roads, established trade associations, and supported security task forces in Umuahia and Aba.`,
        policies: `Administrative Reforms Plan, Local Government Autonomy Directives, and Trade Corridor Empowerment Initiatives.`,
        stateOfOrigin: 'Abia State',
        lga: LGAs[Math.floor(Math.random() * LGAs.length)],
        status: gov.end && gov.end.getTime() < new Date().getTime() ? 'Past' : 'Active',
        predecessorId: predecessorId,
        createdById: creatorId,
        photograph: `https://api.dicebear.com/7.x/adventurer/svg?seed=${gov.name.replace(/\s+/g, '')}`
      }
    });
    predecessorId = leader.id;
    leadersList.push(leader);
  }

  // Generate 90 additional leaders (Commissioners, Senators, Speakers)
  for (let i = 11; i <= 100; i++) {
    const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    const name = `${fName} ${lName}`;
    const pos = LEADERSHIP_POSITIONS[Math.floor(Math.random() * LEADERSHIP_POSITIONS.length)];
    const office = OFFICES[Math.floor(Math.random() * OFFICES.length)];
    const party = PARTIES[Math.floor(Math.random() * PARTIES.length)];
    const lga = LGAs[Math.floor(Math.random() * LGAs.length)];

    const yearOffset = 1999 + Math.floor(Math.random() * 25);
    const start = new Date(`${yearOffset}-06-01`);
    const end = Math.random() > 0.2 ? new Date(`${yearOffset + 4}-05-29`) : null;

    const leader = await prisma.leader.create({
      data: {
        fullName: name,
        politicalParty: party,
        position: pos,
        officeHeld: `${pos} of ${office}`,
        startDate: start,
        endDate: end,
        biography: `Honorable ${name} is a distinguished political leader from the ${lga} Local Government Area of Abia State. They have served in multiple government sectors to advance legislative representation, community programs, and local development.`,
        achievements: `Facilitated ${lga} high-school upgrades, supported agricultural micro-credits, and spearheaded key legislative reviews in state corridors.`,
        policies: `Educational Standard Uplift Scheme, Grassroots Micro-Agro Financing Policy.`,
        stateOfOrigin: 'Abia State',
        lga,
        status: end ? 'Past' : 'Active',
        createdById: creatorId,
        photograph: `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}`
      }
    });
    leadersList.push(leader);
  }

  // 3. Generate 300 Historical Events
  console.log('Seeding 300 Historical Events...');
  const categoryTemplates = [
    { cat: 'Political', title: 'Establishment of', desc: 'A key development marking state representation, administrative adjustments, and leadership transitions in government buildings.' },
    { cat: 'Infrastructure', title: 'Commissioning of', desc: 'Major structural achievements including highway link setups, hospital extensions, dry docks facilities, and public power grids.' },
    { cat: 'Cultural', title: 'Festival Celebration at', desc: 'Centuries-old festivals such as the Ikeji Festival, New Yam Celebrations, and traditional assemblies that maintain Abia heritage.' },
    { cat: 'Economic', title: 'Launch of Free Trade Zone at', desc: 'Economic policies fostering market expansion, industrial clusters, and agricultural trade networks in the Aba industrial zone.' },
    { cat: 'Social', title: 'Opening of State University Campus in', desc: 'Investments in state libraries, primary health setups, teacher workshops, and localized welfare initiatives.' }
  ];

  const abiaLocations = [
    { name: 'Umuahia State Capital', lat: 5.5267, lng: 7.4898 },
    { name: 'Aba Trade Hub', lat: 5.1066, lng: 7.3697 },
    { name: 'Arochukwu Caves Complex', lat: 5.3789, lng: 7.9135 },
    { name: 'Bende LGA Secretariat', lat: 5.5612, lng: 7.6322 },
    { name: 'Ohafia War Dance Arena', lat: 5.6328, lng: 7.8285 },
    { name: 'Isuikwuato Valley Reserve', lat: 5.7533, lng: 7.4277 }
  ];

  const eventsList: any[] = [];
  for (let i = 1; i <= 300; i++) {
    const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    const locationObj = abiaLocations[Math.floor(Math.random() * abiaLocations.length)];
    const lgaName = LGAs[Math.floor(Math.random() * LGAs.length)];
    const title = `${template.title} ${lgaName} ${template.cat} Center (Event #${i})`;
    
    const yearOffset = 1991 + Math.floor(Math.random() * 34);
    const date = new Date(`${yearOffset}-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`);

    const event = await prisma.historicalEvent.create({
      data: {
        title,
        description: `This event marks the historic ${template.title.toLowerCase()} in ${lgaName}, Abia State. ${template.desc} It played a significant role in shape-shifting local development, expanding accessibility, and creating jobs for citizens residing across LGAs.`,
        category: template.cat,
        date,
        location: `${locationObj.name}, ${lgaName} LGA`,
        latitude: locationObj.lat + (Math.random() - 0.5) * 0.05,
        longitude: locationObj.lng + (Math.random() - 0.5) * 0.05,
        image: `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80`,
        createdById: creatorId
      }
    });

    eventsList.push(event);

    // Link dynamic relation between leaders and events
    // Let's link 1 to 3 random leaders to this event
    const leadersToLinkCount = Math.floor(Math.random() * 3) + 1;
    const shuffledLeaders = [...leadersList].sort(() => 0.5 - Math.random());
    for (let l = 0; l < leadersToLinkCount && l < shuffledLeaders.length; l++) {
      await prisma.leaderEventRelation.create({
        data: {
          leaderId: shuffledLeaders[l].id,
          eventId: event.id
        }
      });
    }
  }

  // 4. Generate 1000 Documents
  console.log('Seeding 1000 Documents...');
  const docCategories = ['Gazette', 'Policy Paper', 'Treaty', 'Newspaper Archive', 'Oral History Transcript', 'Research Paper', 'Constitution Draft'];
  const docExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'txt'];
  const docStatuses = [DocStatus.APPROVED, DocStatus.PENDING_APPROVAL, DocStatus.DRAFT, DocStatus.REJECTED];

  let docBatch: any[] = [];
  for (let i = 1; i <= 1000; i++) {
    const category = docCategories[Math.floor(Math.random() * docCategories.length)];
    const ext = docExtensions[Math.floor(Math.random() * docExtensions.length)];
    const title = `Abia State Historical ${category} Vol. ${10 + Math.floor(i / 10)} (#${i})`;
    const status = Math.random() > 0.15 ? DocStatus.APPROVED : docStatuses[Math.floor(Math.random() * docStatuses.length)];
    const uploader = usersData[Math.floor(Math.random() * usersData.length)];
    
    // Choose approvedBy if approved
    const approvedById = status === DocStatus.APPROVED ? creatorId : null;

    docBatch.push({
      title,
      description: `Official state repository document for ${category} records. This cataloged archive records key legislative agreements, regional development drafts, leadership profiles, or state planning guidelines dating from 1991 to index #${i}.`,
      fileUrl: `/uploads/documents/document_${i}.${ext}`,
      fileType: ext.toUpperCase(),
      fileSize: Math.floor(Math.random() * 15000000) + 50000, // 50KB to 15MB
      category,
      status,
      version: Math.floor(Math.random() * 3) + 1,
      uploaderId: uploader.id,
      approvedById: approvedById,
      createdAt: new Date(2020 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
    });

    if (docBatch.length === 100 || i === 1000) {
      await prisma.document.createMany({
        data: docBatch
      });
      console.log(`Seeded ${i} documents...`);
      docBatch = [];
    }
  }

  // 5. Seed some Audit Logs
  console.log('Seeding initial audit logs...');
  const auditLogsData = [
    { userId: creatorId, action: 'SYSTEM_INITIALIZATION', details: 'Initialized Abia State KMS database and populated starting seed records.' },
    { userId: creatorId, action: 'USER_REGISTER', details: 'Created default administrative logins: superadmin, admin, historian, contributor.' },
    { userId: usersData[1].id, action: 'LEADER_CREATE', details: 'Added historical details for early executive governors: Dr. Ogbonnaya Onu.' },
    { userId: usersData[2].id, action: 'DOCUMENT_UPLOAD', details: 'Uploaded Abia State Gazzette Vol 12 on regional borders.' }
  ];

  for (const log of auditLogsData) {
    await prisma.auditLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        details: log.details,
        ipAddress: '192.168.1.1'
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
