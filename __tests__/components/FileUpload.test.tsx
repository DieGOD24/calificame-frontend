import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "@/components/ui/FileUpload";

describe("FileUpload", () => {
  const mockOnFilesSelected = vi.fn();
  const mockOnRemoveFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders drag and drop zone", () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);
    expect(
      screen.getByText(/arrastra y suelta archivos aqui/i)
    ).toBeInTheDocument();
  });

  it("renders file input", () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);
    const input = screen.getByLabelText(/subir archivos/i);
    expect(input).toBeInTheDocument();
  });

  it("renders file type hint", () => {
    render(<FileUpload onFilesSelected={mockOnFilesSelected} />);
    expect(screen.getByText(/PDF, PNG o JPG/i)).toBeInTheDocument();
  });

  it("renders file list when files are provided", () => {
    const files = [
      new File(["content"], "test.pdf", { type: "application/pdf" }),
      new File(["content"], "image.png", { type: "image/png" }),
    ];

    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        files={files}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    expect(screen.getByText("test.pdf")).toBeInTheDocument();
    expect(screen.getByText("image.png")).toBeInTheDocument();
  });

  it("renders remove button for each file", () => {
    const files = [
      new File(["content"], "test.pdf", { type: "application/pdf" }),
    ];

    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        files={files}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    expect(screen.getByLabelText(/eliminar test.pdf/i)).toBeInTheDocument();
  });

  it("calls onRemoveFile when remove button is clicked", async () => {
    const user = userEvent.setup();
    const files = [
      new File(["content"], "test.pdf", { type: "application/pdf" }),
    ];

    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        files={files}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    await user.click(screen.getByLabelText(/eliminar test.pdf/i));
    expect(mockOnRemoveFile).toHaveBeenCalledWith(0);
  });

  it("disables the dropzone when disabled prop is true", () => {
    render(
      <FileUpload onFilesSelected={mockOnFilesSelected} disabled />
    );
    const dropzoneText = screen.getByText(/arrastra y suelta/i);
    // Walk up to find the div with the border-dashed class (the dropzone container)
    let el: HTMLElement | null = dropzoneText;
    while (el && !el.className.includes("border-dashed")) {
      el = el.parentElement;
    }
    expect(el?.className).toContain("cursor-not-allowed");
  });

  it("renders file sizes correctly", () => {
    const files = [
      new File(["x".repeat(1500)], "small.pdf", { type: "application/pdf" }),
    ];

    render(
      <FileUpload
        onFilesSelected={mockOnFilesSelected}
        files={files}
        onRemoveFile={mockOnRemoveFile}
      />
    );

    expect(screen.getByText(/KB/)).toBeInTheDocument();
  });
});
