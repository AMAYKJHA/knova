import asyncio
import unittest

from src.onboarding.service import save_user_interests


class DummyResult:
    def scalar_one_or_none(self):
        return None


class DummyDB:
    def __init__(self):
        self.added = []

    def add(self, obj):
        self.added.append(obj)

    async def execute(self, *args, **kwargs):
        return DummyResult()

    async def commit(self):
        return None

    async def refresh(self, obj):
        return None


class DummyUser:
    def __init__(self):
        self.id = "user-1"
        self.onboarding_completed = False
        self.creator_profile = None
        self.last_active_at = None


class OnboardingServiceTests(unittest.TestCase):
    def test_save_user_interests_marks_onboarding_complete(self):
        async def run_test():
            db = DummyDB()
            user = DummyUser()

            await save_user_interests(db, user, ["Physics", "Math"])

            self.assertTrue(user.onboarding_completed)
            self.assertIsNotNone(user.creator_profile)
            self.assertEqual(user.creator_profile.primary_topics, ["Physics", "Math"])
            self.assertTrue(db.added)

        asyncio.run(run_test())


if __name__ == "__main__":
    unittest.main()
