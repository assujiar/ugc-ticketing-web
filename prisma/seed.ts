import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ============================================
  // SEED ROLES (9 roles from blueprint)
  // ============================================
  console.log("📝 Seeding roles...");

  const roles = [
    {
      name: "super_admin",
      display_name: "Super Admin",
      description: "Platform Administrator with unrestricted access",
    },
    {
      name: "marketing_manager",
      display_name: "Marketing Manager",
      description: "Manager of Marketing Department",
    },
    {
      name: "marketing_staff",
      display_name: "Marketing Staff",
      description: "Staff member of Marketing Department",
    },
    {
      name: "sales_manager",
      display_name: "Sales Manager",
      description: "Manager of Sales Department",
    },
    {
      name: "salesperson",
      display_name: "Salesperson",
      description: "Sales team member",
    },
    {
      name: "domestics_ops_manager",
      display_name: "Domestics Ops Manager",
      description: "Manager of Domestics Operations Department",
    },
    {
      name: "exim_ops_manager",
      display_name: "Exim Ops Manager",
      description: "Manager of Exim Operations Department",
    },
    {
      name: "import_dtd_ops_manager",
      display_name: "Import DTD Ops Manager",
      description: "Manager of Import DTD Operations Department",
    },
    {
      name: "warehouse_traffic_ops_manager",
      display_name: "Warehouse & Traffic Ops Manager",
      description: "Manager of Warehouse & Traffic Operations Department",
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {
        display_name: role.display_name,
        description: role.description,
      },
      create: role,
    });
  }

  console.log(`✅ Seeded ${roles.length} roles`);

  // ============================================
  // SEED DEPARTMENTS (6 departments from blueprint)
  // ============================================
  console.log("📝 Seeding departments...");

  const departments = [
    {
      code: "MKT",
      name: "Marketing",
      description: "Marketing Department",
    },
    {
      code: "SAL",
      name: "Sales",
      description: "Sales Department",
    },
    {
      code: "DOM",
      name: "Domestics Operations",
      description: "Domestics Operations Department",
    },
    {
      code: "EXI",
      name: "Exim Operations",
      description: "Exim Operations Department",
    },
    {
      code: "DTD",
      name: "Import DTD Operations",
      description: "Import DTD Operations Department",
    },
    {
      code: "TRF",
      name: "Warehouse & Traffic Operations",
      description: "Warehouse & Traffic Operations Department",
    },
  ];

  const createdDepartments: Record<string, string> = {};

  for (const dept of departments) {
    const created = await prisma.department.upsert({
      where: { code: dept.code },
      update: {
        name: dept.name,
        description: dept.description,
      },
      create: dept,
    });
    createdDepartments[dept.code] = created.id;
  }

  console.log(`✅ Seeded ${departments.length} departments`);

  // ============================================
  // SEED SLA_CONFIG (Default SLA for each department)
  // ============================================
  console.log("📝 Seeding SLA configurations...");

  const ticketTypes = ["RFQ", "GEN"];
  let slaCount = 0;

  for (const deptCode of Object.keys(createdDepartments)) {
    const departmentId = createdDepartments[deptCode];
    
    if (!departmentId) continue;

    for (const ticketType of ticketTypes) {
      await prisma.sLAConfig.upsert({
        where: {
          department_id_ticket_type: {
            department_id: departmentId,
            ticket_type: ticketType,
          },
        },
        update: {
          first_response_hours: 24,
          resolution_hours: 72,
        },
        create: {
          department_id: departmentId,
          ticket_type: ticketType,
          first_response_hours: 24, // 24 hours for first response
          resolution_hours: 72, // 72 hours for resolution
        },
      });
      slaCount++;
    }
  }

  console.log(`✅ Seeded ${slaCount} SLA configurations`);

  // ============================================
  // SEED INSTRUCTIONS FOR SUPER ADMIN
  // ============================================
  console.log("\n📋 POST-SEED INSTRUCTIONS:");
  console.log("=====================================");
  console.log("To create a Super Admin user:");
  console.log("1. Go to Supabase Dashboard > Authentication > Users");
  console.log("2. Click 'Add User' and create a new user with email/password");
  console.log("3. Copy the user's UUID");
  console.log("4. Run the following SQL in Supabase SQL Editor:\n");

  const superAdminRole = await prisma.role.findUnique({
    where: { name: "super_admin" },
  });

  if (superAdminRole) {
    console.log(`
INSERT INTO public.users (id, email, full_name, role_id, is_active)
VALUES (
  'YOUR_AUTH_USER_UUID_HERE',
  'admin@example.com',
  'Super Admin',
  '${superAdminRole.id}',
  true
);
    `);
  }

  console.log("=====================================\n");
  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });