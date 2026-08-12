from apscheduler.schedulers.background import BackgroundScheduler


def start():
    from .monitoring_tasks import run_due_checks

    scheduler = BackgroundScheduler()
    scheduler.add_job(run_due_checks, "interval", minutes=1, id="run_due_checks", replace_existing=True)
    scheduler.start()
from apscheduler.schedulers.background import BackgroundScheduler


def start():
    from .monitoring_tasks import run_due_checks
    from .telegram_link import poll_telegram_updates

    scheduler = BackgroundScheduler()
    scheduler.add_job(run_due_checks, "interval", minutes=1, id="run_due_checks", replace_existing=True)
    scheduler.add_job(poll_telegram_updates, "interval", seconds=10, id="poll_telegram_updates", replace_existing=True)
    scheduler.start()