const { Client } = require('pg');
const Scrypt = require('scrypt-kdf');
const crypto = require('crypto');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.yumyjivpmdwkpdvrnurh:DatnEcom2026SecurePass@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('✅ Connected to database.');

  const email = 'sprylo123@gmail.com';
  const rawPassword = '@dmin12345678';
  
  // Hash password using Scrypt (Medusa v2 default)
  const hashBuffer = await Scrypt.kdf(rawPassword, { logN: 15, r: 8, p: 1 });
  const hashedPassword = hashBuffer.toString('base64');

  console.log('🔑 Password hashed successfully with Medusa v2 Scrypt.');

  // 1. Create or update ADMIN USER in "user" table
  const userCheck = await client.query(`SELECT id FROM "user" WHERE email = $1`, [email]);
  let userId;
  if (userCheck.rows.length === 0) {
    userId = 'usr_' + crypto.randomBytes(12).toString('hex');
    await client.query(`
      INSERT INTO "user" (id, email, first_name, last_name, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
    `, [userId, email, 'Sprylo', 'Admin']);
    console.log(`✅ Created Admin User in "user" table with ID: ${userId}`);
  } else {
    userId = userCheck.rows[0].id;
    console.log(`ℹ️ Admin User already exists in "user" table with ID: ${userId}`);
  }

  // 2. Create or update CLIENT STORE CUSTOMER in "customer" table
  const custCheck = await client.query(`SELECT id FROM customer WHERE email = $1`, [email]);
  let customerId;
  if (custCheck.rows.length === 0) {
    customerId = 'cus_' + crypto.randomBytes(12).toString('hex');
    await client.query(`
      INSERT INTO customer (id, email, first_name, last_name, has_account, created_at, updated_at)
      VALUES ($1, $2, $3, $4, true, NOW(), NOW())
    `, [customerId, email, 'Sprylo', 'Admin']);
    console.log(`✅ Created Customer in "customer" table with ID: ${customerId}`);
  } else {
    customerId = custCheck.rows[0].id;
    console.log(`ℹ️ Customer already exists in "customer" table with ID: ${customerId}`);
  }

  // 3. Setup Auth Identity & Provider Identity linking BOTH user_id and customer_id
  const prvCheck = await client.query(`
    SELECT pi.id as prv_id, pi.auth_identity_id
    FROM provider_identity pi
    WHERE pi.entity_id = $1 AND pi.provider = 'emailpass'
  `, [email]);

  let authIdentityId;
  let providerIdentityId;

  if (prvCheck.rows.length === 0) {
    authIdentityId = 'auth_id_' + crypto.randomBytes(12).toString('hex');
    providerIdentityId = 'prv_id_' + crypto.randomBytes(12).toString('hex');

    await client.query(`
      INSERT INTO auth_identity (id, app_metadata, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
    `, [authIdentityId, JSON.stringify({ user_id: userId, customer_id: customerId, actor_id: customerId, actor_type: 'customer' })]);

    await client.query(`
      INSERT INTO provider_identity (id, auth_identity_id, entity_id, provider, provider_metadata, user_metadata, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [
      providerIdentityId,
      authIdentityId,
      email,
      'emailpass',
      JSON.stringify({ password: hashedPassword }),
      JSON.stringify({ email, first_name: 'Sprylo', last_name: 'Admin' })
    ]);

    console.log(`✅ Created Auth Identity & Provider Identity linking Admin (${userId}) & Customer (${customerId}).`);
  } else {
    authIdentityId = prvCheck.rows[0].auth_identity_id;
    providerIdentityId = prvCheck.rows[0].prv_id;

    await client.query(`
      UPDATE auth_identity
      SET app_metadata = COALESCE(app_metadata, '{}'::jsonb) || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2
    `, [JSON.stringify({ user_id: userId, customer_id: customerId }), authIdentityId]);

    await client.query(`
      UPDATE provider_identity
      SET provider_metadata = jsonb_set(COALESCE(provider_metadata, '{}'::jsonb), '{password}', $1::jsonb),
          user_metadata = COALESCE(user_metadata, '{}'::jsonb) || $2::jsonb,
          updated_at = NOW()
      WHERE id = $3
    `, [JSON.stringify(hashedPassword), JSON.stringify({ email, first_name: 'Sprylo', last_name: 'Admin' }), providerIdentityId]);

    console.log(`✅ Updated Auth Identity & Provider Identity password for ${email}.`);
  }

  await client.end();
  console.log('\n🎉 Successfully configured Admin & Customer accounts for sprylo123@gmail.com with password @dmin12345678!');
}

main().catch(err => {
  console.error('❌ Error configuring account:', err);
  process.exit(1);
});
