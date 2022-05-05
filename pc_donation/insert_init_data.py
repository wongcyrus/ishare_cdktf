import random as rand
from datetime import date
from functools import wraps
from time import time

from azure.cognitiveservices.vision.face import FaceClient
from msrest.authentication import CognitiveServicesCredentials

from app import SQLAlchemy, create_app
from app.azure_ai.face import PersonGroupEnum
from app.model.models import Region, EquipmentType, Admin, School
from app.model.status_enum import SchoolCategoryEnum, GenderEnum
# The default password is P@ssw0rd.
from config import AiFaceConfig

password_hash = "pbkdf2:sha256:150000$hIcu3Dhn$5590ce353d7d4cebea1b85be035dcf4d19bc142501d6d1259c9b2de06ed081e8"
photo_blob = "donor/user/donor/2021_07_13_04_11_38/Donor.jpg"

number_of_school = 10
number_of_equipment = 10
number_of_teacher = 100


def timer(func):
    @wraps(func)
    def _time_it(*args, **kwargs):
        start = int(round(time() * 1000))
        try:
            return func(*args, **kwargs)
        finally:
            end_ = int(round(time() * 1000)) - start
            print(func.__name__ + f" total execution time: {end_ if end_ > 0 else 0} ms")

    return _time_it


def random_latitude():
    return (22.4393278 - 22.1193278) * rand.randint(0, 500) / 1000 + 22.1193278


def random_longitude():
    return (114.3228131 - 114.0028131) * rand.randint(500, 1000) / 1000 + 114.0028131


def get_sample_school():
    return db.session.query(School).limit(number_of_school).all()


app = create_app()
db = SQLAlchemy(app, use_native_unicode='utf8')


@timer
def region_data():
    r = ['CENTRAL AND WESTERN',
         'EASTERN',
         'ISLANDS',
         'KOWLOON CITY',
         'KWAI TSING',
         'KWUN TONG',
         'NORTH',
         'SAI KUNG',
         'SHA TIN',
         'SHAM SHUI PO',
         'SOUTHERN',
         'TAI PO',
         'TSUEN WAN',
         'TUEN MUN',
         'WAN CHAI',
         'WONG TAI SIN',
         'YAU TSIM MONG',
         'YUEN LONG',
         ]
    db.session.add_all(list(map(lambda x: Region(name=x), r)))
    db.session.commit()


@timer
def school_data():
    import csv
    schools = []
    mapping = {
        'Aided Primary Schools': SchoolCategoryEnum.AIDED_PRIMARY_SCHOOLS,
        'Aided Secondary Schools': SchoolCategoryEnum.AIDED_SECONDARY_SCHOOLS,
        'Aided Special Schools': SchoolCategoryEnum.AIDED_SPECIAL_SCHOOLS,
        'Caput Secondary Schools': SchoolCategoryEnum.CAPUT_SECONDARY_SCHOOLS,
        'Direct Subsidy Scheme Primary Schools': SchoolCategoryEnum.DIRECT_SUBSIDY_SCHEME_PRIMARY_SCHOOLS,
        'Direct Subsidy Scheme Secondary Schools': SchoolCategoryEnum.DIRECT_SUBSIDY_SCHEME_SECONDARY_SCHOOLS,
        'English Schools Foundation (Primary)': SchoolCategoryEnum.ENGLISH_SCHOOLS_FOUNDATION_PRIMARY,
        'English Schools Foundation (Secondary)': SchoolCategoryEnum.ENGLISH_SCHOOLS_FOUNDATION_SECONDARY,
        'Government Primary Schools': SchoolCategoryEnum.GOVERNMENT_PRIMARY_SCHOOLS,
        'Government Secondary Schools': SchoolCategoryEnum.GOVERNMENT_SECONDARY_SCHOOLS,
        'International Schools (Primary)': SchoolCategoryEnum.INTERNATIONAL_SCHOOLS_PRIMARY,
        'International Schools (Secondary)': SchoolCategoryEnum.INTERNATIONAL_SCHOOLS_SECONDARY,
        'Kindergarten-cum-child Care Centres': SchoolCategoryEnum.KINDERGARTEN_CUM_CHILD_CARE_CENTRES,
        'Kindergartens': SchoolCategoryEnum.KINDERGARTENS,
        'Private Primary Schools': SchoolCategoryEnum.PRIVATE_PRIMARY_SCHOOLS,
        'Private Secondary Schools (Day/Evening)': SchoolCategoryEnum.PRIVATE_SECONDARY_SCHOOLS_DAY_EVENING,
    }

    with open('data/SCH_LOC_EDB.csv', newline='', encoding="utf8") as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')

        for row in reader:
            school = School()
            school.id = row['\ufeffSCHOOL NO.']
            school.name_en = row['ENGLISH NAME']
            school.name_zh_Hant = row['中文名稱']
            school.address_en = row['ENGLISH ADDRESS']
            school.address_zh_Hant = row['中文地址']
            school.url = row['WEBSITE']
            school.phone_number = row['TELEPHONE']
            school.latitude = row['LATITUDE']
            school.longitude = row['LONGITUDE']
            school.region = db.session.query(Region).filter_by(name=row['DISTRICT']).first()
            school.category = mapping[row['ENGLISH CATEGORY']]
            # print(school)
            schools.append(school)
    db.session.add_all(schools)
    db.session.commit()


@timer
def equipment_type_data():
    r = ['Desktop', 'Laptop', 'Router', 'Mobile phone', 'SIM card', 'Keyboard', 'Mouse', 'Monitor', 'Microphone',
         'Headphone', 'Webcam', 'Tablet', "Window/Office Licence"]

    db.session.add_all(list(map(lambda x: EquipmentType(name=x), r)))

    db.session.commit()


@timer
def admin_data():
    admin = Admin(first_name="Cyrus", last_name="Wong", username="admin", email="vtcfyp123@gmail.com",
                  phone_number=12345678,
                  password_hash=password_hash,
                  gender=GenderEnum.MALE,
                  dateOfBirth=date.fromisoformat('2019-12-04'),
                  activated=True, region_id=1)
    db.session.add_all([admin])
    db.session.commit()
    print(admin)


def reset_person_groups():
    face_client = FaceClient(AiFaceConfig.ENDPOINT, CognitiveServicesCredentials(AiFaceConfig.KEY))
    # delete all
    # for a in face_client.person_group.list():
    #     print(a)
    #     face_client.person_group.delete(person_group_id=a.person_group_id)
    person_group_ids = set(map(lambda x: x.person_group_id, face_client.person_group.list()))

    for name, member in PersonGroupEnum.__members__.items():
        if name in person_group_ids:
            print("Delete Person Group: " + name)
            face_client.person_group.delete(person_group_id=name, name=name)
        print("Create Person Group: " + name)
        face_client.person_group.create(person_group_id=name, name=name)
        person_id = "TheDummyPerson"
        person_group_person = face_client.person_group_person.create(person_group_id=name, name=person_id)
        w = open("./data/Test Image/ID card/1.jpg", 'r+b')
        face_client.person_group_person.add_face_from_stream(name, person_group_person.person_id, w)
        face_client.person_group.train(person_group_id=name)


# the required data
with app.app_context():
    region_data()
    school_data()
    admin_data()
    equipment_type_data()

reset_person_groups()
