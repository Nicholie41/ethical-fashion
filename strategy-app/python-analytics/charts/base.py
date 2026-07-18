import base64
import io

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

# Matches StrategyExec frontend palette
PALETTE = {
    "primary": "#4f46e5",
    "primary_light": "#818cf8",
    "accent": "#6366f1",
    "navy": "#111827",
    "text": "#0f172a",
    "text_muted": "#64748b",
    "border": "#e2e8f0",
    "surface": "#f8fafc",
    "on_track": "#059669",
    "behind": "#d97706",
    "at_risk": "#dc2626",
    "completed": "#6366f1",
    "revenue": "#4f46e5",
    "roi_bar": "#4f46e5",
}

STATUS_LABELS = {
    "on-track": "On track",
    "behind": "Behind",
    "at-risk": "At risk",
    "completed": "Completed",
}

STATUS_COLORS = {
    "on-track": PALETTE["on_track"],
    "behind": PALETTE["behind"],
    "at-risk": PALETTE["at_risk"],
    "completed": PALETTE["completed"],
}


def fig_to_base64(fig) -> str:
    buffer = io.BytesIO()
    fig.savefig(
        buffer,
        format="png",
        bbox_inches="tight",
        dpi=160,
        facecolor=fig.get_facecolor(),
        edgecolor="none",
        pad_inches=0.35,
    )
    plt.close(fig)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def _apply_style():
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Segoe UI", "Arial", "DejaVu Sans", "sans-serif"],
            "font.size": 11,
            "axes.labelsize": 11,
            "axes.labelcolor": PALETTE["text_muted"],
            "axes.edgecolor": PALETTE["border"],
            "axes.linewidth": 0.8,
            "xtick.color": PALETTE["text_muted"],
            "ytick.color": PALETTE["text_muted"],
            "figure.facecolor": "#ffffff",
            "axes.facecolor": "#ffffff",
            "grid.color": PALETTE["border"],
            "grid.linewidth": 0.7,
            "legend.frameon": False,
            "legend.fontsize": 10,
        }
    )


def create_figure(width=7.5, height=4.0):
    _apply_style()
    fig, ax = plt.subplots(figsize=(width, height))
    fig.subplots_adjust(left=0.12, right=0.96, top=0.96, bottom=0.18)
    ax.set_facecolor("#ffffff")
    ax.grid(axis="y", alpha=0.45, linestyle="--", linewidth=0.7)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    return fig, ax


def progress_color(value: float) -> str:
    if value >= 70:
        return PALETTE["on_track"]
    if value >= 40:
        return PALETTE["behind"]
    return PALETTE["at_risk"]


def draw_empty_state(ax, message: str):
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    ax.text(
        0.5,
        0.5,
        message,
        ha="center",
        va="center",
        fontsize=12,
        color=PALETTE["text_muted"],
        fontweight="500",
    )
