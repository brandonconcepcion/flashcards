import React, { useState, useMemo } from "react";
import { BarChart3, Target, PieChart, LineChart } from "lucide-react";
import type { Flashcard } from "../types/flashcard";

interface AnalyticsTabProps {
  flashcards: Flashcard[];
  folders: any[];
}

interface StudyData {
  date: string;
  cardsReviewed: number;
  averageDifficulty: number;
  categories: string[];
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ flashcards }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "7d" | "30d" | "90d" | "all"
  >("30d");
  const [selectedChart, setSelectedChart] = useState<
    "progress" | "difficulty" | "categories" | "timeline"
  >("progress");

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const now = new Date();
    const timeframeDays = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      all: Infinity,
    };

    const cutoffDate = new Date(
      now.getTime() - timeframeDays[selectedTimeframe] * 24 * 60 * 60 * 1000
    );

    const filteredCards =
      selectedTimeframe === "all"
        ? flashcards
        : flashcards.filter(
            (card) =>
              card.lastReviewed && new Date(card.lastReviewed) >= cutoffDate
          );

    // Difficulty distribution
    const difficultyStats = {
      easy: filteredCards.filter((card) => card.difficulty === "easy").length,
      medium: filteredCards.filter((card) => card.difficulty === "medium")
        .length,
      hard: filteredCards.filter((card) => card.difficulty === "hard").length,
    };

    // Category distribution
    const categoryStats = filteredCards.reduce((acc, card) => {
      acc[card.category] = (acc[card.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Study timeline data
    const timelineData: StudyData[] = [];
    const daysToShow = Math.min(timeframeDays[selectedTimeframe], 30);

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];

      const dayCards = filteredCards.filter(
        (card) =>
          card.lastReviewed &&
          new Date(card.lastReviewed).toISOString().split("T")[0] === dateStr
      );

      timelineData.push({
        date: dateStr,
        cardsReviewed: dayCards.length,
        averageDifficulty:
          dayCards.length > 0
            ? dayCards.reduce((sum, card) => {
                const difficultyValue =
                  card.difficulty === "easy"
                    ? 1
                    : card.difficulty === "medium"
                    ? 2
                    : 3;
                return sum + difficultyValue;
              }, 0) / dayCards.length
            : 0,
        categories: [...new Set(dayCards.map((card) => card.category))],
      });
    }

    return {
      totalCards: filteredCards.length,
      reviewedCards: filteredCards.filter((card) => card.lastReviewed).length,
      averageReviewCount:
        filteredCards.reduce((sum, card) => sum + card.reviewCount, 0) /
          filteredCards.length || 0,
      difficultyStats,
      categoryStats,
      timelineData,
      topCategories: Object.entries(categoryStats)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count })),
    };
  }, [flashcards, selectedTimeframe]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "#22c55e";
      case "medium":
        return "#f59e0b";
      case "hard":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const renderProgressChart = () => (
    <div className="chart-container">
      <h3>Study Progress</h3>
      <div className="progress-metrics">
        <div className="metric-card">
          <div className="metric-value">{analyticsData.reviewedCards}</div>
          <div className="metric-label">Cards Reviewed</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {Math.round(analyticsData.averageReviewCount * 10) / 10}
          </div>
          <div className="metric-label">Avg Reviews/Card</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {analyticsData.totalCards > 0
              ? Math.round(
                  (analyticsData.reviewedCards / analyticsData.totalCards) * 100
                )
              : 0}
            %
          </div>
          <div className="metric-label">Completion Rate</div>
        </div>
      </div>
    </div>
  );

  const renderDifficultyChart = () => (
    <div className="chart-container">
      <h3>Difficulty Distribution</h3>
      <div className="difficulty-chart">
        {Object.entries(analyticsData.difficultyStats).map(
          ([difficulty, count]) => (
            <div key={difficulty} className="difficulty-bar">
              <div className="difficulty-label">{difficulty}</div>
              <div className="bar-container">
                <div
                  className="bar-fill"
                  style={{
                    width: `${
                      (count /
                        Math.max(
                          ...Object.values(analyticsData.difficultyStats)
                        )) *
                      100
                    }%`,
                    backgroundColor: getDifficultyColor(difficulty),
                  }}
                />
              </div>
              <div className="difficulty-count">{count}</div>
            </div>
          )
        )}
      </div>
    </div>
  );

  const renderCategoriesChart = () => (
    <div className="chart-container">
      <h3>Top Categories</h3>
      <div className="categories-chart">
        {analyticsData.topCategories.map(({ category, count }, index) => (
          <div key={category} className="category-item">
            <div className="category-info">
              <div className="category-name">{category || "Uncategorized"}</div>
              <div className="category-count">{count} cards</div>
            </div>
            <div className="category-bar">
              <div
                className="category-fill"
                style={{
                  width: `${
                    (count /
                      Math.max(
                        ...analyticsData.topCategories.map((c) => c.count)
                      )) *
                    100
                  }%`,
                  backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimelineChart = () => (
    <div className="chart-container">
      <h3>Study Timeline</h3>
      <div className="timeline-chart">
        {analyticsData.timelineData.map((day) => (
          <div key={day.date} className="timeline-day">
            <div className="day-label">
              {new Date(day.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="day-metrics">
              <div className="day-cards">
                <div className="day-value">{day.cardsReviewed}</div>
                <div className="day-label">cards</div>
              </div>
              {day.averageDifficulty > 0 && (
                <div className="day-difficulty">
                  <div className="day-value">
                    {day.averageDifficulty.toFixed(1)}
                  </div>
                  <div className="day-label">avg diff</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="analytics-tab">
      <div className="analytics-header">
        <h2>Study Analytics</h2>
        <div className="analytics-controls">
          <div className="timeframe-selector">
            <label>Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-selector">
        <button
          className={`chart-btn ${
            selectedChart === "progress" ? "active" : ""
          }`}
          onClick={() => setSelectedChart("progress")}
        >
          <BarChart3 size={16} />
          Progress
        </button>
        <button
          className={`chart-btn ${
            selectedChart === "difficulty" ? "active" : ""
          }`}
          onClick={() => setSelectedChart("difficulty")}
        >
          <PieChart size={16} />
          Difficulty
        </button>
        <button
          className={`chart-btn ${
            selectedChart === "categories" ? "active" : ""
          }`}
          onClick={() => setSelectedChart("categories")}
        >
          <Target size={16} />
          Categories
        </button>
        <button
          className={`chart-btn ${
            selectedChart === "timeline" ? "active" : ""
          }`}
          onClick={() => setSelectedChart("timeline")}
        >
          <LineChart size={16} />
          Timeline
        </button>
      </div>

      <div className="analytics-content">
        {selectedChart === "progress" && renderProgressChart()}
        {selectedChart === "difficulty" && renderDifficultyChart()}
        {selectedChart === "categories" && renderCategoriesChart()}
        {selectedChart === "timeline" && renderTimelineChart()}
      </div>
    </div>
  );
};

export default AnalyticsTab;
