from charts.base import PALETTE, create_figure, fig_to_base64


def build_scenario_chart(investment, uplift_percent, payback_months, projected_roi):
    fig, ax = create_figure(width=7.5, height=3.8)
    months = list(range(0, max(payback_months, 6) + 7))
    monthly_gain = (investment * (uplift_percent / 100.0)) / max(payback_months, 1)
    cumulative_return = [min(monthly_gain * month, investment * projected_roi * 2) for month in months]

    ax.plot(
        months,
        cumulative_return,
        color=PALETTE["on_track"],
        linewidth=2.8,
        marker="o",
        markersize=5,
        label="Cumulative return",
    )
    ax.axvline(
        payback_months,
        color=PALETTE["at_risk"],
        linestyle="--",
        linewidth=1.8,
        label=f"Payback at {payback_months} months",
    )
    ax.set_xlabel("Months", fontweight="600", color=PALETTE["text"])
    ax.set_ylabel("Cumulative return ($)", fontweight="600", color=PALETTE["text"])
    ax.legend(loc="upper left", fontsize=10)
    ax.set_ylim(0, max(cumulative_return) * 1.1 if cumulative_return else 1)

    return fig_to_base64(fig)
