import { faker } from '@faker-js/faker';
import { CreateUserRequest } from '@appTypes/user';

// ─── Email Generator ──────────────────────────────────────────────────────────
// Timestamp suffix guarantees uniqueness across parallel test runs
// Format: testuser.1714123456789.abc123@example.com
export const randomEmail = (): string => {
  const timestamp = Date.now();
  const suffix    = faker.string.alphanumeric(6).toLowerCase();
  return `testuser.${timestamp}.${suffix}@example.com`;
};

// ─── Password Generator ───────────────────────────────────────────────────────
// Generates a password that meets common API requirements:
// min 8 chars, uppercase, lowercase, number, special char
export const randomPassword = (): string => {
  const upper   = faker.string.alpha({ length: 2, casing: 'upper' });
  const lower   = faker.string.alpha({ length: 4, casing: 'lower' });
  const number  = faker.string.numeric(2);
  const special = faker.helpers.arrayElement(['@', '#', '!', '$']);
  // Shuffle and combine
  return `${upper}${lower}${number}${special}`;
};

// ─── Name Generators ──────────────────────────────────────────────────────────
export const randomFirstName  = (): string => faker.person.firstName();
export const randomLastName   = (): string => faker.person.lastName();
export const randomFullName   = (): string => faker.person.fullName();

// ─── Address Generators ───────────────────────────────────────────────────────
export const randomAddress    = (): string => faker.location.streetAddress();
export const randomCity       = (): string => faker.location.city();
export const randomState      = (): string => faker.location.state();
export const randomZipcode    = (): string => faker.location.zipCode('#####');
export const randomCountry    = (): string => faker.helpers.arrayElement([
  'India', 'United States', 'Canada', 'Australia', 'United Kingdom',
]);

// ─── Phone Generator ──────────────────────────────────────────────────────────
export const randomPhone = (): string => faker.phone.number('##########');

// ─── Company Generator ────────────────────────────────────────────────────────
export const randomCompany = (): string => faker.company.name();

// ─── Date of Birth Generators ────────────────────────────────────────────────
// Returns separate day, month, year strings matching API field names
export const randomDOB = (): { birth_date: string; birth_month: string; birth_year: string } => {
  const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' });
  return {
    birth_date:  String(dob.getDate()),
    birth_month: String(dob.getMonth() + 1),  // getMonth() is 0-indexed
    birth_year:  String(dob.getFullYear()),
  };
};

// ─── Title Generator ──────────────────────────────────────────────────────────
export const randomTitle = (): 'Mr' | 'Mrs' | 'Miss' | 'Ms' | 'Dr' => {
  return faker.helpers.arrayElement(['Mr', 'Mrs', 'Miss', 'Ms', 'Dr']);
};

// ─── Search Term Generator ────────────────────────────────────────────────────
// Returns terms that automationexercise.com search endpoint recognises
export const randomSearchTerm = (): string => {
  return faker.helpers.arrayElement(['top', 'tshirt', 'jean', 'dress', 'skirt']);
};

// ─── Full User Payload Generator ──────────────────────────────────────────────
// Generates a complete CreateUserRequest payload
// Accepts overrides for specific fields — perfect for targeted test scenarios
// Usage: generateUser()                        → full random user
// Usage: generateUser({ email: 'x@test.com' }) → random user with fixed email
export const generateUser = (
  overrides?: Partial<CreateUserRequest>
): CreateUserRequest => {
  const dob = randomDOB();

  return {
    name:          randomFullName(),
    email:         randomEmail(),
    password:      randomPassword(),
    title:         randomTitle(),
    birth_date:    dob.birth_date,
    birth_month:   dob.birth_month,
    birth_year:    dob.birth_year,
    firstname:     randomFirstName(),
    lastname:      randomLastName(),
    company:       randomCompany(),
    address1:      randomAddress(),
    address2:      randomAddress(),
    country:       randomCountry(),
    zipcode:       randomZipcode(),
    state:         randomState(),
    city:          randomCity(),
    mobile_number: randomPhone(),
    ...overrides,     // Spread overrides LAST — they win over generated values
  };
};

// ─── UUID Generator ───────────────────────────────────────────────────────────
export const randomUUID = (): string => faker.string.uuid();

// ─── Random integer in range ──────────────────────────────────────────────────
export const randomInt = (min: number, max: number): number =>
  faker.number.int({ min, max });

// ─── Random string ────────────────────────────────────────────────────────────
export const randomString = (length = 10): string =>
  faker.string.alphanumeric(length);
