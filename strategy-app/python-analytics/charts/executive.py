import matplotlib.pyplot as plt

from charts.base import (
    PALETTE,
    STATUS_COLORS,
    STATUS_LABELS,
    create_figure,
    draw_empty_state,
    fig_to_base64,
    progress_color,
)


def build_revenue_chart():
    fig, ax = create_figure(width=7.5, height=3.8)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    revenue = [100, 120, 145, 160, 190, 225]

    ax.plot(months, revenue, color=PALETTE["revenue"], linewidth=2.8, marker="o", markersize=6)
    ax.fill_between(months, revenue, color=PALETTE["primary_light"], alpha=0.18)
    ax.set_ylabel("Revenue ($k)", fontweight="600", color=PALETTE["text"])
    ax.tick_params(axis="x", labelsize=10)
    ax.set_ylim(0, max(revenue) * 1.12)

    return fig_to_base64(fig)


def build_okr_progress_chart(okrs):
    if not okrs:
        fig, ax = create_figure(width=7.5, height=3.2)
        draw_empty_state(ax, "No objectives yet — create an OKR to see progress.")
        return fig_to_base64(fig)

    titles = [item.get("title", "Objective")[:32] for item in okrs]
    progress = [item.get("overallProgress", 0) for item in okrs]
    colors = [progress_color(value) for value in progress]
    height = max(3.2, len(titles) * 0.72)

    fig, ax = create_figure(width=7.5, height=height)
    ax.grid(axis="x", alpha=0.45, linestyle="--", linewidth=0.7)
    ax.grid(axis="y", visible=False)

    bars = ax.barh(titles, progress, color=colors, height=0.55, edgecolor="white", linewidth=0.8)
    ax.set_xlim(0, 100)
    ax.set_xlabel("Progress (%)", fontweight="600", color=PALETTE["text"])
    ax.invert_yaxis()
    ax.bar_label(bars, fmt="%.0f%%", padding=4, fontsize=10, fontweight="600", color=PALETTE["text"])

    return fig_to_base64(fig)


def build_kr_status_chart(okrs):
    counts = {"on-track": 0, "behind": 0, "at-risk": 0, "completed": 0}
    for okr in okrs:
        for kr in okr.get("keyResults", []):
            status = kr.get("status", "on-track")
            if status in counts:
                counts[status] += 1

    active = [(STATUS_LABELS[key], counts[key], STATUS_COLORS[key]) for key in counts if counts[key] > 0]
    fig, ax = plt.subplots(figsize=(6.2, 4.0))
    fig.patch.set_facecolor("#ffffff")
    ax.set_facecolor("#ffffff")

    if not active:
        draw_empty_state(ax, "No key results yet — add key results to your OKRs.")
        return fig_to_base64(fig)

    labels, values, colors = zip(*active)
    total = sum(values)

    wedges, texts, autotexts = ax.pie(
        values,
        colors=colors,
        startangle=90,
        counterclock=False,
        autopct=lambda pct: f"{pct:.0f}%" if pct >= 8 else "",
        pctdistance=0.72,
        wedgeprops={"width": 0.42, "edgecolor": "white", "linewidth": 2},
        textprops={"fontsize": 10, "fontweight": "600", "color": PALETTE["text"]},
    )

    for autotext in autotexts:
        autotext.set_color("#ffffff")

    legend_labels = [f"{label}  ({count})" for label, count, _ in active]
    ax.legend(
        wedges,
        legend_labels,
        loc="center left",
        bbox_to_anchor=(1.02, 0.5),
        fontsize=10,
        frameon=False,
    )

    ax.text(0, 0, f"{total}\nKRs", ha="center", va="center", fontsize=13, fontweight="700", color=PALETTE["text"])

    fig.subplots_adjust(left=0.02, right=0.72, top=0.98, bottom=0.06)
    return fig_to_base64(fig)


def build_initiative_roi_chart(initiatives):
    if not initiatives:
        fig, ax = create_figure(width=7.5, height=3.2)
        draw_empty_state(ax, "No initiatives yet — add an initiative to compare ROI.")
        return fig_to_base64(fig)

    names = [item.get("name", "Initiative")[:28] for item in initiatives]
    roi = [round(float(item.get("expectedROI", 0)) * 100, 1) for item in initiatives]
    height = max(3.5, len(names) * 0.65)

    fig, ax = create_figure(width=7.5, height=height)
    ax.grid(axis="x", alpha=0.45, linestyle="--", linewidth=0.7)
    ax.grid(axis="y", visible=False)

    bars = ax.barh(names, roi, color=PALETTE["roi_bar"], height=0.55, edgecolor="white", linewidth=0.8)
    ax.set_xlabel("Expected ROI (%)", fontweight="600", color=PALETTE["text"])
    ax.set_xlim(0, max(roi) * 1.18 if roi else 25)
    ax.invert_yaxis()
    ax.bar_label(bars, fmt="%.1f%%", padding=4, fontsize=10, fontweight="600", color=PALETTE["text"])

    return fig_to_base64(fig)


def build_executive_dashboard_charts(organization_name, okrs, initiatives):
    return {
        "engine": "python-matplotlib",
        "organizationName": organization_name,
        "charts": {
            "okrProgress": build_okr_progress_chart(okrs),
            "krStatusMix": build_kr_status_chart(okrs),
            "initiativeRoi": build_initiative_roi_chart(initiatives),
            "revenueTrend": build_revenue_chart(),
        },
    }
