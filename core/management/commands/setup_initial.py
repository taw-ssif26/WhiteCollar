from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Teacher, AboutInfo, Class

class Command(BaseCommand):
    help = 'Setup initial data for the application'

    def handle(self, *args, **options):
        # Create teacher
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
            self.stdout.write('Teacher user created!')

        teacher, created = Teacher.objects.get_or_create(
            user=teacher_user,
            defaults={
                'name': 'Mahmudul Karim Raju',
                'designation': 'Founder & Head Teacher',
                'bio': 'A visionary educator with over 15 years of experience in English language teaching.',
                'education': 'MA in English Literature, University of Dhaka',
                'experience': '15+ years of teaching experience',
                'achievements': 'Published author, International speaker',
                'timeline': '2012 - Founded Elite English\n2018 - Global Accreditation\nPresent - Innovation',
            }
        )
        if created:
            self.stdout.write('Teacher profile created!')

        # Create about info
        about, created = AboutInfo.objects.get_or_create(
            title='About Elite English',
            defaults={
                'description': 'Elite English Coaching provides an unparalleled educational experience designed for the visionaries of tomorrow.',
                'mission': 'To provide high-quality language education that prepares students for success in a globalized world.',
                'vision': 'To be the premier English coaching institution in the region.',
                'values': 'Innovation, Excellence, Empathy'
            }
        )
        if created:
            self.stdout.write('About info created!')

        # Create sample classes
        classes = ['Class 10', 'Class 11', 'Class 12', 'IELTS', 'Spoken English']
        for cls in classes:
            Class.objects.get_or_create(
                name=cls,
                section='A',
                defaults={'description': f'{cls} - Regular Batch'}
            )
        self.stdout.write('Sample classes created!')

        self.stdout.write(self.style.SUCCESS('Initial setup completed!'))
