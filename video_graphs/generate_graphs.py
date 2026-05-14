"""
IEcare — Video Overlay Graphs (v2)
High-quality transparent PNGs for iMovie foreground overlay on cinematic footage.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import matplotlib.patheffects as pe
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch
import numpy as np
from pathlib import Path

OUT = Path(__file__).parent / "output"
OUT.mkdir(exist_ok=True)

# ── Palette ──────────────────────────────────────────────
NAVY      = "#0F1B2D"
TEAL      = "#0E7C86"
TEAL_LIGHT= "#12A3B0"
RED       = "#B23A48"
RED_LIGHT = "#D4495C"
AMBER     = "#D4973B"
AMBER_LIGHT = "#E8B560"
PURPLE    = "#7B5EA7"
BLUE      = "#3A7CA5"
OFF_WHITE = "#F7F6F2"
CREAM     = "#E8E6DF"
MID_GREY  = "#9A9790"

BIND_COLOURS = {"Budget": RED, "Space": AMBER, "Dual": BLUE}
BIND_COLOURS_LIGHT = {"Budget": RED_LIGHT, "Space": AMBER_LIGHT, "Dual": "#5A9CC5"}

# ── Data ─────────────────────────────────────────────────
hospitals_raw = [
    ("Large National\nReferral",       201.4, "Budget"),
    ("University\nTeaching",            87.4, "Budget"),
    ("Regional District\nGeneral",      55.5, "Budget"),
    ("Small\nCommunity",                30.6, "Budget"),
    ("ICU",                             20.9, "Dual"),
    ("Paediatric\nSpecialist",          43.5, "Budget"),
    ("Private\nPremium",                40.2, "Space"),
    ("Day Surgery\nCentre",             60.6, "Space"),
    ("Rural\nCottage",                  10.9, "Budget"),
    ("Military\nField",                 37.3, "Space"),
    ("Psychiatric\nInpatient",          36.2, "Budget"),
    ("Pandemic\nSurge",               434.8, "Budget"),
]
hospitals_raw.sort(key=lambda x: x[1])
names   = [h[0] for h in hospitals_raw]
pstars  = [h[1] for h in hospitals_raw]
binds   = [h[2] for h in hospitals_raw]


# ═══════════════════════════════════════════════════════════
# GRAPH 1 — Horizontal bar chart: 12 hospitals by P*
# ═══════════════════════════════════════════════════════════
def make_bar_chart():
    fig, ax = plt.subplots(figsize=(16, 9))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    bar_height = 0.58

    for i, (name, pstar, bind) in enumerate(zip(names, pstars, binds)):
        base_col = BIND_COLOURS[bind]
        light_col = BIND_COLOURS_LIGHT[bind]
        # Shadow bar
        ax.barh(i, pstar, height=bar_height * 1.15, color=base_col, alpha=0.25,
                edgecolor="none", zorder=2)
        # Main bar
        ax.barh(i, pstar, height=bar_height, color=base_col, alpha=0.92,
                edgecolor="none", zorder=3)
        # Top highlight line
        ax.plot([0, pstar], [i + bar_height * 0.42, i + bar_height * 0.42],
                color=light_col, linewidth=1.2, alpha=0.5, zorder=4)
        # Value label
        label = f"{pstar:.0f}" if pstar == int(pstar) else f"{pstar:.1f}"
        txt = ax.text(pstar + 8, i, label, va="center", ha="left",
                      fontsize=13, fontweight="700", color=OFF_WHITE, zorder=5)
        txt.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

    # Y-axis
    ax.set_yticks(range(len(names)))
    ax.set_yticklabels(names, fontsize=10.5, fontweight="500", color=CREAM,
                       linespacing=1.15)
    for lab in ax.get_yticklabels():
        lab.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])

    # X-axis
    ax.set_xlabel("Optimal Patient Capacity  (P*)", fontsize=14, fontweight="700",
                  color=OFF_WHITE, labelpad=14)
    ax.xaxis.label.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])
    ax.tick_params(axis="x", labelsize=10, colors=MID_GREY, length=0)
    ax.set_xlim(0, max(pstars) * 1.15)

    # Subtle grid
    for x in ax.get_xticks():
        if x > 0:
            ax.axvline(x, color=OFF_WHITE, alpha=0.06, linewidth=0.8, zorder=1)

    for sp in ax.spines.values():
        sp.set_visible(False)

    # Legend
    legend_patches = [mpatches.Patch(facecolor=c, edgecolor="none", label=l)
                      for l, c in BIND_COLOURS.items()]
    leg = ax.legend(handles=legend_patches, loc="lower right",
                    fontsize=11, frameon=True, ncol=3,
                    handlelength=1.5, handleheight=1.0,
                    columnspacing=1.5, borderpad=0.8)
    leg.get_frame().set_facecolor(NAVY)
    leg.get_frame().set_alpha(0.7)
    leg.get_frame().set_edgecolor("none")
    for text in leg.get_texts():
        text.set_color(OFF_WHITE)
        text.set_fontweight("600")
        text.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])

    fig.tight_layout(pad=2)
    fig.savefig(OUT / "bar_chart_12hospitals.png", dpi=300, transparent=True,
                bbox_inches="tight")
    plt.close(fig)
    print("  bar_chart_12hospitals.png")


# ═══════════════════════════════════════════════════════════
# GRAPH 2 — Donut chart: staff vs equipment cost
# ═══════════════════════════════════════════════════════════
def make_donut():
    fig, ax = plt.subplots(figsize=(8, 8))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    sizes  = [92, 8]
    cols   = [RED, TEAL]
    cols_light = [RED_LIGHT, TEAL_LIGHT]

    # Outer glow ring
    ax.pie(sizes, startangle=90, colors=[c + "55" for c in cols],
           wedgeprops=dict(width=0.32, edgecolor="none"), radius=1.08)
    # Main ring
    wedges, _ = ax.pie(sizes, startangle=90, colors=cols,
                       wedgeprops=dict(width=0.28, edgecolor="none"), radius=1.02)
    # Inner highlight edge
    ax.pie(sizes, startangle=90, colors=cols_light,
           wedgeprops=dict(width=0.03, edgecolor="none"), radius=0.74)

    # Percentage labels on ring
    for i, (wedge, pct) in enumerate(zip(wedges, sizes)):
        ang = (wedge.theta2 + wedge.theta1) / 2
        x = 0.88 * np.cos(np.radians(ang))
        y = 0.88 * np.sin(np.radians(ang))
        txt = ax.text(x, y, f"{pct}%", ha="center", va="center",
                      fontsize=22, fontweight="800", color=OFF_WHITE)
        txt.set_path_effects([pe.withStroke(linewidth=4, foreground=NAVY)])

    # External labels with connector lines
    labels = ["Staff Salaries", "Equipment\n& Beds"]
    for i, (wedge, label) in enumerate(zip(wedges, labels)):
        ang = (wedge.theta2 + wedge.theta1) / 2
        x1 = 1.05 * np.cos(np.radians(ang))
        y1 = 1.05 * np.sin(np.radians(ang))
        x2 = 1.32 * np.cos(np.radians(ang))
        y2 = 1.32 * np.sin(np.radians(ang))
        ax.plot([x1, x2], [y1, y2], color=cols_light[i], linewidth=1.5, alpha=0.7)
        ax.plot(x2, y2, 'o', color=cols_light[i], markersize=4, alpha=0.8)
        ha = "left" if x2 > 0 else "right"
        x_off = 0.08 if x2 > 0 else -0.08
        txt = ax.text(x2 + x_off, y2, label, ha=ha, va="center",
                      fontsize=13, fontweight="600", color=OFF_WHITE, linespacing=1.3)
        txt.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

    # Subtitle under staff label
    sub_ang = (wedges[0].theta2 + wedges[0].theta1) / 2
    sx = 1.32 * np.cos(np.radians(sub_ang))
    sy = 1.32 * np.sin(np.radians(sub_ang))
    ha = "left" if sx > 0 else "right"
    x_off = 0.08 if sx > 0 else -0.08
    stxt = ax.text(sx + x_off, sy - 0.18, "across 3 daily shifts",
                   ha=ha, va="top", fontsize=9, color=MID_GREY, fontstyle="italic")
    stxt.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])

    # Centre text
    t1 = ax.text(0, 0.06, "Cost per", ha="center", va="center",
                 fontsize=13, fontweight="400", color=MID_GREY)
    t1.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])
    t2 = ax.text(0, -0.1, "Patient Slot", ha="center", va="center",
                 fontsize=15, fontweight="700", color=OFF_WHITE)
    t2.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

    ax.set_aspect("equal")
    ax.set_xlim(-1.7, 1.7)
    ax.set_ylim(-1.5, 1.5)
    fig.tight_layout(pad=0.5)
    fig.savefig(OUT / "donut_cost_split.png", dpi=300, transparent=True,
                bbox_inches="tight")
    plt.close(fig)
    print("  donut_cost_split.png")


# ═══════════════════════════════════════════════════════════
# GRAPH 3 — Leverage comparison bar
# ═══════════════════════════════════════════════════════════
def make_leverage_bar():
    fig, ax = plt.subplots(figsize=(14, 5))
    fig.patch.set_alpha(0)
    ax.set_facecolor("none")

    interventions = [
        "Cut equipment cost  (-10%)",
        "Improve staffing ratio\n(+1 patient / clinician / shift)",
    ]
    impacts = [0.8, 9.0]
    bar_cols = [MID_GREY, TEAL]
    bar_cols_light = [CREAM, TEAL_LIGHT]
    bar_height = 0.45

    for i, (interv, impact, col, col_l) in enumerate(
            zip(interventions, impacts, bar_cols, bar_cols_light)):
        ax.barh(i, impact, height=bar_height * 1.15, color=col, alpha=0.25,
                edgecolor="none", zorder=2)
        ax.barh(i, impact, height=bar_height, color=col, alpha=0.9,
                edgecolor="none", zorder=3)
        ax.plot([0, impact], [i + bar_height * 0.48, i + bar_height * 0.48],
                color=col_l, linewidth=1.2, alpha=0.5, zorder=4)
        txt = ax.text(impact + 0.2, i, f"+{impact:.1f}%", va="center", ha="left",
                      fontsize=16, fontweight="800", color=col_l, zorder=5)
        txt.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

    ax.set_yticks(range(len(interventions)))
    ax.set_yticklabels(interventions, fontsize=12.5, fontweight="500", color=CREAM,
                       linespacing=1.2)
    for lab in ax.get_yticklabels():
        lab.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])

    ax.set_xlim(0, 13)
    ax.tick_params(axis="x", colors=MID_GREY, length=0, labelsize=10)
    for sp in ax.spines.values():
        sp.set_visible(False)

    # 11x annotation with arrow
    annot = ax.annotate("11x more\nimpactful", xy=(9.0, 1), xytext=(11, 0.5),
                        fontsize=15, fontweight="800", color=TEAL_LIGHT,
                        ha="center", va="center", linespacing=1.3,
                        arrowprops=dict(arrowstyle="-|>", color=TEAL_LIGHT,
                                        lw=2, connectionstyle="arc3,rad=-0.2"))
    annot.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

    fig.tight_layout(pad=2)
    fig.savefig(OUT / "leverage_bar.png", dpi=300, transparent=True,
                bbox_inches="tight")
    plt.close(fig)
    print("  leverage_bar.png")


# ═══════════════════════════════════════════════════════════
# GRAPH 4 — Two callout cards
# ═══════════════════════════════════════════════════════════
def make_callout_cards():
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
    fig.patch.set_alpha(0)

    def draw_card(ax, title, bind_type, accent, accent_light,
                  s1_label, s1_val, s2_label, s2_val, pstar, insight):
        ax.set_facecolor("none")
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 10)
        ax.axis("off")

        # Card bg
        bg = FancyBboxPatch((0.2, 0.2), 9.6, 9.6, boxstyle="round,pad=0.4",
                            facecolor=NAVY, alpha=0.82,
                            edgecolor=accent, linewidth=2.5, zorder=1)
        ax.add_patch(bg)

        # Accent strip
        strip = FancyBboxPatch((0.5, 8.8), 9.0, 0.6, boxstyle="round,pad=0.15",
                               facecolor=accent, alpha=0.9,
                               edgecolor="none", zorder=2)
        ax.add_patch(strip)

        # Title
        t = ax.text(5, 9.1, title, ha="center", va="center",
                    fontsize=14, fontweight="800", color=OFF_WHITE, zorder=3)
        t.set_path_effects([pe.withStroke(linewidth=2, foreground=accent)])

        # Bind type
        bt = ax.text(5, 7.8, bind_type, ha="center", va="center",
                     fontsize=10.5, fontweight="600", color=accent_light,
                     fontstyle="italic", zorder=3)
        bt.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])

        # Stat 1
        ax.text(2.5, 6.3, s1_label, ha="center", va="center",
                fontsize=9, color=MID_GREY, fontweight="500", zorder=3)
        s = ax.text(2.5, 5.4, s1_val, ha="center", va="center",
                    fontsize=20, fontweight="800", color=OFF_WHITE, zorder=3)
        s.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

        # Stat 2
        ax.text(7.5, 6.3, s2_label, ha="center", va="center",
                fontsize=9, color=MID_GREY, fontweight="500", zorder=3)
        s = ax.text(7.5, 5.4, s2_val, ha="center", va="center",
                    fontsize=20, fontweight="800", color=OFF_WHITE, zorder=3)
        s.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

        # P*
        p = ax.text(5, 3.6, f"P* = {pstar}", ha="center", va="center",
                    fontsize=16, fontweight="800", color=accent_light, zorder=3)
        p.set_path_effects([pe.withStroke(linewidth=3, foreground=NAVY)])

        # Divider
        ax.plot([1.5, 8.5], [2.7, 2.7], color=OFF_WHITE, alpha=0.15,
                linewidth=1, zorder=3)

        # Insight
        it = ax.text(5, 1.8, insight, ha="center", va="center",
                     fontsize=9.5, fontweight="500", color=CREAM,
                     fontstyle="italic", linespacing=1.4, zorder=3)
        it.set_path_effects([pe.withStroke(linewidth=2, foreground=NAVY)])

    draw_card(ax1,
              "Private Premium Hospital", "SPACE BINDING",
              AMBER, AMBER_LIGHT,
              "BUDGET USED", "60%", "SPACE USED", "100%", "40.2",
              "Floor fills before money runs out.\nReduce bed footprint to unlock capacity.")

    draw_card(ax2,
              "Rural Cottage Hospital", "BUDGET  /  STAFFING FLOOR",
              PURPLE, "#9B7EC7",
              "MIN STAFF COST", "35%", "OF BUDGET", "420k/yr", "10.9",
              "Regulatory minimums consume budget\nbefore capacity can be optimised.")

    fig.subplots_adjust(wspace=0.12)
    fig.savefig(OUT / "callout_cards.png", dpi=300, transparent=True,
                bbox_inches="tight")
    plt.close(fig)
    print("  callout_cards.png")


# ═══════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("Generating video overlays...")
    make_bar_chart()
    make_donut()
    make_leverage_bar()
    make_callout_cards()
    print(f"\nDone -- files in {OUT.resolve()}")
