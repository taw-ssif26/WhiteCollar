# core/management/commands/setup_initial.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Teacher, AboutInfo, Class

class Command(BaseCommand):
    help = 'Setup initial data for the application'

    def handle(self, *args, **options):
        # Create teacher user
        teacher_user, created = User.objects.get_or_create(
            username='teacher',
            defaults={
                'email': 'teacher@eliteenglish.com',
                'is_staff': True,
            }
        )
        if created:
            teacher_user.set_password('teacher123')
            teacher_user.save()
            self.stdout.write('✅ Teacher user created!')

        # Create teacher profile with proper timeline format
        teacher, created = Teacher.objects.get_or_create(
            user=teacher_user,
            defaults={
                'name': 'Mahmudul Karim Raju',
                'designation': 'Founder & Head Teacher',
                'bio': 'A visionary educator with over 15 years of experience in English language teaching and curriculum development. Passionate about empowering students with the tools they need to succeed in a globalized world.',
                'education': 'MA in English Literature, University of Dhaka\nPG Diploma in TESOL, University of Oxford',
                'experience': '15+ years of teaching experience\n10+ years of curriculum development\n5+ years of teacher training',
                'achievements': 'Published author of 3 books on English language learning\nInternational speaker at 20+ conferences\nRecipient of the National Education Excellence Award 2022',
                'timeline': '2012 - Founded Elite English Academy -- 2015 - Launched the Adaptive Learning Framework -- 2018 - Received Global Accreditation -- 2020 - Expanded to 5 campuses -- 2022 - Published "The Art of English" -- 2024 - Launched AI-powered Learning Platform'
            }
        )
        if created:
            self.stdout.write('✅ Teacher profile created!')

        # Create about info
        about, created = AboutInfo.objects.get_or_create(
            title='About Elite English',
            defaults={
                'description': 'Elite English Coaching provides an unparalleled educational experience designed for the visionaries of tomorrow. Through curated curricula, personalized mentorship from industry leaders, and a commitment to academic rigor, we transform students into articulate leaders.',
                'mission': 'To provide high-quality language education that prepares students for success in a globalized world.',
                'vision': 'To be the premier English coaching institution in the region, recognized for excellence and innovation.',
                'values': 'Innovation: We are committed to staying at the forefront of language education.\nExcellence: We strive for the highest standards in teaching and learning.\nEmpathy: We understand the challenges students face and are committed to supporting them.'
            }
        )
        if created:
            self.stdout.write('✅ About info created!')

        # Create sample classes
        classes = ['Class 10', 'Class 11', 'Class 12', 'IELTS', 'Spoken English']
        for cls in classes:
            Class.objects.get_or_create(
                name=cls,
                section='A',
                defaults={'description': f'{cls} - Regular Batch'}
            )
        self.stdout.write('✅ Sample classes created!')

        self.stdout.write(self.style.SUCCESS('🎉 Initial setup completed!'))
        self.stdout.write('📋 Admin login: teacher / teacher123')
